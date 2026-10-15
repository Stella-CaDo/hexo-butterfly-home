'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const {readSettings, readCache, collectArticles, splitArticle, isFresh, makeEntry, writeCache} = require('./core.cjs');
const {createClient} = require('./model-client.cjs');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const args = process.argv.slice(2);
  const allowed = new Set(['--dry-run', '--force', '--post']);
  let target = null;
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i])) throw new Error('用法：npm run ai:summary -- [--dry-run] [--force] [--post _posts/文章.md]');
    if (args[i] === '--post') { target = args[++i]; if (!target || target.startsWith('--')) throw new Error('--post 需要文章 source 路径'); }
  }
  const dry = args.includes('--dry-run');
  const config = readSettings(root);
  if (!config.enabled) throw new Error('config/ai-summary.json 中已禁用摘要生成');
  if (!dry && config.model === 'configure-your-model') throw new Error('请先在 config/ai-summary.json 配置真实可用的模型名称；未发送请求');
  const file = path.join(root, 'data/ai-summaries.json');
  const cache = readCache(file);
  // This command only processes blog content. Avoid the existing unrelated player build hook.
  const previousSkip = process.env.FOCUS_WALL_SKIP;
  process.env.FOCUS_WALL_SKIP = '1';
  const hexo = new Hexo(root, {silent: true});
  let articles;
  try { await hexo.init(); await hexo.load(); articles = collectArticles(hexo.locals.get('posts').toArray(), hexo.source_dir); }
  finally { await hexo.exit(); if (previousSkip === undefined) delete process.env.FOCUS_WALL_SKIP; else process.env.FOCUS_WALL_SKIP = previousSkip; }
  if (target) { articles = articles.filter(article => article.source === target.replace(/^source\//, '')); if (!articles.length) throw new Error('没有找到符合条件的公开文章'); }
  if (!articles.length) { console.log('[AI 摘要] 没有需要处理的公开文章'); return; }
  let pending = [];
  for (const article of articles) {
    const chunks = splitArticle(article.body, config);
    const fresh = !args.includes('--force') && isFresh(cache.entries[article.id], article, config);
    console.log(`[AI 摘要] ${fresh ? '缓存有效' : '待生成'}：${article.title}（${article.body.length}字符，${chunks.length}段）`);
    if (!fresh) pending.push({article, chunks});
  }
  if (dry || !pending.length) { console.log(`[AI 摘要] ${dry ? '检查完成，未调用模型' : '全部命中缓存，未调用模型'}`); return; }
  const estimated = pending.reduce((sum, item) => sum + item.chunks.length + (item.chunks.length > 1 ? 1 : 0), 0);
  if (estimated > config.maxRequests) throw new Error('预计请求数超过本次上限，请使用 --post 分批生成');
  const envFile = path.join(root, '.env.ai.local');
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
  const key = process.env.BLOG_AI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!key || !key.trim()) throw new Error('未配置密钥。请在本机设置 DEEPSEEK_API_KEY，或复制 .env.ai.example 为 .env.ai.local 后填写；不要通过聊天发送密钥');
  const complete = createClient(config, key.trim());
  let failed = 0;
  for (const {article, chunks} of pending) {
    try {
      const results = [];
      for (const chunk of chunks) results.push(await complete(article.title, chunk, chunks.length > 1));
      if (results.length > 1) results.push(await complete(article.title, results.map((r, i) => `第${i + 1}段：${r.summary}`).join('\n')));
      const usage = results.reduce((total, result) => { for (const [name, value] of Object.entries(result.usage)) total[name] = (total[name] || 0) + value; return total; }, {});
      const entry = makeEntry(article, results.at(-1).summary, config, usage);
      const next = {...cache, entries: {...cache.entries, [article.id]: entry}};
      await writeCache(file, next);
      cache.entries = next.entries;
      console.log(`[AI 摘要] 已保存：${article.title}（${Array.from(entry.summary).length}字）`);
    } catch (error) { failed++; console.error(`[AI 摘要] 失败：${article.title}；${error.message}`); break; }
  }
  if (failed) process.exitCode = 1;
  else console.log('[AI 摘要] 生成完成；运行 npm run build 生成文章页面');
}

main().catch(error => { console.error(`[AI 摘要] ${error.message}`); process.exitCode = 1; });
