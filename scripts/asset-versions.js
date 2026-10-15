'use strict'

// Injected source assets have a long browser cache lifetime on the server.
// Change their URL when their source changes, including the first versioned release.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

hexo.extend.filter.register('before_generate', () => {
  const inject = hexo.theme.config.inject
  if (!inject) return
  for (const position of ['head', 'bottom']) {
    if (!Array.isArray(inject[position])) continue
    inject[position] = inject[position].map(tag => tag.replace(
      /\b(href|src)="(\/(?:css|js)\/[^"?]+\.(?:css|js))(?:\?v=[a-f0-9]+)?"/g,
      (match, attribute, url) => {
        const file = path.join(hexo.source_dir, url.slice(1))
        if (!fs.existsSync(file)) return match
        const version = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12)
        return `${attribute}="${url}?v=${version}"`
      }
    ))
  }
})
