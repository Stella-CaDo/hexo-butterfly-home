'use strict';

const path = require('node:path');
const {readSettings, readCache, collectArticles, isFresh, canonicalKey, injectSummary} = require('./core.cjs');

module.exports = function register(hexo, {cacheFile = path.join(hexo.base_dir, 'data/ai-summaries.json')} = {}) {
  let entries = new Map();
  hexo.extend.generator.register('ai-summary', function (locals) {
    entries = new Map();
    try {
      const config = readSettings(hexo.base_dir);
      if (!config.enabled) return [];
      const cache = readCache(cacheFile);
      for (const article of collectArticles(locals.posts.toArray(), hexo.source_dir)) {
        const entry = cache.entries[article.id];
        if (isFresh(entry, article, config)) entries.set(canonicalKey(article.url), entry);
        else if (entry) hexo.log.warn(`[AI 摘要] ${article.title} 的摘要已过期，本次隐藏；请重新生成`);
      }
    } catch { hexo.log.warn('[AI 摘要] 配置或缓存不可用，本次隐藏摘要；原文章正常生成'); }
    return [];
  });
  // Only the final document is changed; post content, excerpts and search data stay untouched.
  hexo.extend.filter.register('after_render:html', html => injectSummary(html, entries), 5);
};
