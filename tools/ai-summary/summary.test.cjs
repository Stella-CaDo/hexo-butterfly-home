'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const core = require('./core.cjs');
const {createClient} = require('./model-client.cjs');
const settings = core.readSettings(path.resolve(__dirname, '../..'));
const summary = '这是一段仅用于自动化验证的摘要样例，介绍文章的主题和主要内容，检查生成结果能否正确保存、读取并显示在正文顶部。测试样例不会调用真实模型，也不会写入博客的正式摘要数据。'.repeat(2);
const response = (content = summary, extra = {}) => new Response(JSON.stringify({choices: [{finish_reason: 'stop', message: {content: JSON.stringify({summary: content})}}], usage: {prompt_tokens: 20, completion_tokens: 30, total_tokens: 50}, ...extra}));

function fixture(t, body = '# 原文\n\n正文\n\n```python\nprint("原代码")\n```\n\n|项目|值|\n|---|---|\n|正文|保留|') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-ai-summary-'));
  fs.mkdirSync(path.join(dir, '_posts'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const file = path.join(dir, '_posts/article.md');
  const raw = `---\ntitle: 原标题\n---\n${body}\n`;
  fs.writeFileSync(file, raw);
  const post = {source: '_posts/article.md', layout: 'post', published: true, permalink: 'https://example.com/article/', path: 'article/index.html'};
  return {dir, file, raw, post, article: core.articleFromPost(post, dir)};
}

test('LF/CRLF are equivalent, code and tables survive, source bytes are unchanged', t => {
  const f = fixture(t);
  const original = fs.readFileSync(f.file);
  assert.ok(f.article.body.includes('print("原代码")'));
  assert.ok(f.article.body.includes('|正文|保留|'));
  assert.deepEqual(fs.readFileSync(f.file), original);
  fs.writeFileSync(f.file, f.raw.replace(/\n/g, '\r\n'));
  assert.equal(core.articleFromPost(f.post, f.dir).contentHash, f.article.contentHash);
});

test('draft/private/password/opt-out files and paths outside posts are excluded', t => {
  const f = fixture(t);
  assert.equal(core.articleFromPost({...f.post, published: false}, f.dir), null);
  assert.equal(core.articleFromPost({...f.post, source: '_posts/../../secret.md'}, f.dir), null);
  assert.equal(core.articleFromPost({...f.post, layout: 'page'}, f.dir), null);
  for (const field of ['published: false', 'private: true', 'hidden: true', 'hide: true', 'password: local-password', 'ai_summary: false']) {
    fs.writeFileSync(f.file, f.raw.replace('title: 原标题', `title: 原标题\n${field}`));
    assert.equal(core.articleFromPost(f.post, f.dir), null, field);
  }
});

test('body, title, URL, model and prompt changes invalidate cached output', t => {
  const {article} = fixture(t);
  const entry = core.makeEntry(article, summary, settings);
  assert.ok(core.isFresh(entry, article, settings));
  for (const changed of [{...article, contentHash: 'changed'}, {...article, title: 'changed'}, {...article, url: article.url + 'new/'}]) assert.equal(core.isFresh(entry, changed, settings), false);
  for (const changed of [{...settings, model: 'new-model'}, {...settings, promptVersion: 'v2'}, {...settings, endpoint: 'https://other.example/chat/completions'}]) assert.equal(core.isFresh(entry, article, changed), false);
});

test('chunking preserves every paragraph, complete fences and tables; oversized inputs fail', () => {
  const body = '前言'.repeat(12) + '\n\n```js\nconst x = 1;\n\nconsole.log(x);\n```\n\n|列|值|\n|---|---|\n|末尾|没有丢失|\n\n' + '结尾'.repeat(12);
  const config = {...settings, chunkCharacters: 60};
  const chunks = core.splitArticle(body, config);
  assert.equal(chunks.join('\n\n'), body);
  assert.ok(chunks.some(chunk => chunk.includes('```js\nconst x = 1;\n\nconsole.log(x);\n```')));
  assert.throws(() => core.splitArticle('x'.repeat(61), config), /不会截断/);
  assert.throws(() => core.splitArticle(body, {...config, maxArticleCharacters: 20}), /不会截断/);
});

test('atomic cache replacement works on Windows and malformed caches stay intact', async t => {
  const f = fixture(t);
  const file = path.join(f.dir, 'cache.json');
  const cache = {schemaVersion: 1, entries: {}};
  await core.writeCache(file, cache);
  cache.entries[f.article.id] = core.makeEntry(f.article, summary, settings);
  await core.writeCache(file, cache);
  assert.ok(core.isFresh(core.readCache(file).entries[f.article.id], f.article, settings));
  assert.equal(fs.readdirSync(f.dir).filter(name => name.endsWith('.tmp')).length, 0);
  fs.writeFileSync(file, 'broken');
  assert.throws(() => core.readCache(file));
  assert.equal(fs.readFileSync(file, 'utf8'), 'broken');
});

test('rendering is article-only, once, before original content, and escapes text', t => {
  const {article} = fixture(t);
  const entry = {...core.makeEntry(article, summary, settings), summary: '内容 & <script>alert("x")</script>'};
  const entries = new Map([[core.canonicalKey(article.url), entry]]);
  const html = '<html><head><link rel=canonical href="https://example.com/article/"></head><body><article id="article-container"><p>原文</p></article></body></html>';
  const result = core.injectSummary(html, entries);
  assert.equal((result.match(/data-ai-summary=/g) || []).length, 1);
  assert.ok(result.indexOf('文章摘要') < result.indexOf('<p>原文</p>'));
  assert.ok(result.includes('&lt;script&gt;'));
  assert.equal(core.injectSummary(result, entries), result);
  assert.equal(core.injectSummary('<article id="article-container">原文</article>', entries), '<article id="article-container">原文</article>');
  assert.equal(core.injectSummary(html.replace('example.com/article/', 'example.com/blog/'), entries), html.replace('example.com/article/', 'example.com/blog/'));
});

test('DeepSeek request keeps all source, JSON mode, disabled thinking and masked error handling', async () => {
  let sent;
  const complete = createClient(settings, 'test-only-key', {fetchImpl: async (url, options) => {sent = {url, options}; return response();}});
  const content = '正文\n```python\nprint(1)\n```\n结尾';
  const result = await complete('标题', content);
  const body = JSON.parse(sent.options.body);
  assert.equal(sent.url, settings.endpoint);
  assert.equal(sent.options.headers.Authorization, 'Bearer test-only-key');
  assert.equal(body.model, settings.model);
  assert.equal(body.thinking.type, 'disabled');
  assert.equal(body.response_format.type, 'json_object');
  assert.equal(JSON.parse(body.messages[1].content).article, content);
  assert.equal(result.summary, summary);
  assert.equal(result.usage.total_tokens, 50);
});

test('429 retries are bounded; authentication errors do not retry or leak response/key', async () => {
  let calls = 0;
  const retry = createClient(settings, 'test-only-key', {sleep: async () => {}, fetchImpl: async () => ++calls < 3 ? new Response('temporary', {status: 429}) : response()});
  await retry('标题', '正文'); assert.equal(calls, 3);
  calls = 0;
  const fail = createClient(settings, 'sensitive-sentinel', {fetchImpl: async () => {calls++; return new Response('sensitive-sentinel private response', {status: 401});}});
  await assert.rejects(fail('标题', '正文'), error => error.message.includes('401') && !error.message.includes('sensitive-sentinel') && !error.message.includes('private response'));
  assert.equal(calls, 1);
});

test('timeouts and run request budgets are bounded and do not expose request data', async () => {
  let calls = 0;
  let aborts = 0;
  const timeout = createClient({...settings, timeoutMs: 10}, 'key-sentinel', {sleep: async () => {}, fetchImpl: async (url, {signal}) => {
    calls++;
    return new Promise((resolve, reject) => {
      const keepAlive = setTimeout(() => reject(new Error('signal did not abort')), 100);
      signal.addEventListener('abort', () => {aborts++; clearTimeout(keepAlive); reject(new Error('key-sentinel private body'));}, {once: true});
    });
  }});
  await assert.rejects(timeout('title', 'body'), error => /超时/.test(error.message) && !/sentinel|private/.test(error.message));
  assert.equal(calls, 3);
  assert.equal(aborts, 3);
  const limited = createClient({...settings, maxRequests: 1}, 'test-only-key', {fetchImpl: async () => response()});
  await limited('title', 'body');
  await assert.rejects(limited('title', 'body'), /请求上限/);
});

test('truncated, empty, HTML and invalid JSON responses are never accepted', async () => {
  for (const result of [response(summary, {choices: [{finish_reason: 'length', message: {content: JSON.stringify({summary})}}]}), response(''), response('<script>恶意</script>'.repeat(10)), new Response('broken')]) {
    await assert.rejects(createClient(settings, 'test-only-key', {fetchImpl: async () => result})('title', 'body'));
  }
});

test('Manual examples have explicit provenance; ordinary summaries retain AI label', () => {
  const value = { id: 'example', summary: '<untrusted>' };
  assert.match(core.markup({...value, example: true}), /人工编写示例/);
  assert.doesNotMatch(core.markup({...value, example: true}), />AI 生成</);
  assert.match(core.markup(value), />AI 生成</);
  assert.match(core.markup(value), /&lt;untrusted&gt;/);
});
