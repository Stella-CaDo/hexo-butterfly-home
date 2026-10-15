'use strict';

const {SYSTEM_PROMPT, validateSummary} = require('./core.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function limitedJson(response) {
  const reader = response.body.getReader();
  let size = 0;
  const buffers = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1024 * 1024) throw new Error('模型响应超过大小上限');
      buffers.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(buffers).toString('utf8'));
  } finally { await reader.cancel().catch(() => {}); }
}

function createClient(config, key, {fetchImpl = fetch, sleep = wait} = {}) {
  let requests = 0;
  return async function complete(title, content, partial = false) {
    const body = {
      model: config.model,
      messages: [{role: 'system', content: SYSTEM_PROMPT + (partial ? '当前输入是文章分段，只概述该分段的事实，保留供最终合并的重要信息。' : '')}, {role: 'user', content: JSON.stringify({title, article: content})}],
      response_format: {type: 'json_object'}, thinking: {type: 'disabled'},
      temperature: 0.2, max_tokens: config.maxOutputTokens, stream: false
    };
    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      if (++requests > config.maxRequests) throw new Error('已达到本次运行的模型请求上限');
      let response;
      try {
        response = await fetchImpl(config.endpoint, {method: 'POST', redirect: 'error', signal: AbortSignal.timeout(config.timeoutMs), headers: {'Content-Type': 'application/json', Authorization: `Bearer ${key}`}, body: JSON.stringify(body)});
      } catch {
        if (attempt < config.attempts) { await sleep(750 * attempt); continue; }
        throw new Error('模型网络请求失败或超时；未记录密钥、请求内容或服务端错误正文');
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        const temporary = [408, 429].includes(response.status) || response.status >= 500;
        if (temporary && attempt < config.attempts) { await sleep(750 * attempt); continue; }
        throw new Error(`模型返回 HTTP ${response.status}；请检查凭据、余额、模型与接口配置`);
      }
      let json;
      try { json = await limitedJson(response); } catch { throw new Error('模型响应 JSON 无效或超过大小上限'); }
      if (json.choices?.[0]?.finish_reason !== 'stop') throw new Error('模型结果被截断或未正常完成；未保存');
      let value;
      try { value = JSON.parse(json.choices[0].message.content); } catch { throw new Error('模型没有返回有效的摘要 JSON；未保存'); }
      const usage = {};
      for (const name of ['prompt_tokens', 'completion_tokens', 'total_tokens']) if (Number.isSafeInteger(json.usage?.[name]) && json.usage[name] >= 0) usage[name] = json.usage[name];
      return {summary: validateSummary(value.summary), usage};
    }
  };
}

module.exports = {createClient};
