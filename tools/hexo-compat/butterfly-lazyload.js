/**
 * Butterfly lazyload compatibility fix for this repository (installed by tools/fix-hexo-compat.js).
 * Preserve raw script/style content and comments while enhancing actual images.
 */
'use strict'

const urlFor = require('hexo-util').url_for.bind(hexo)
const protectedBlocks = /(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->)/gi
const imageTags = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
const attributes = tag => Array.from(tag.matchAll(/\s+([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g))

const lazyload = htmlContent => {
  const config = hexo.theme.config.lazyload
  const bg = config.native ? null : (config.placeholder ? urlFor(config.placeholder) : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')

  return htmlContent.split(protectedBlocks).map((segment, index) => {
    if (index % 2) return segment
    return segment.replace(imageTags, tag => {
      const attrs = attributes(tag)
      if (config.native) {
        if (attrs.some(attribute => attribute[1].toLowerCase() === 'loading')) return tag
        return tag.replace(/\s*\/?>(?=$)/, ending => ' loading="lazy"' + (ending.includes('/') ? ' />' : '>'))
      }
      if (attrs.some(attribute => attribute[1].toLowerCase() === 'data-lazy-src')) return tag
      const source = attrs.find(attribute => attribute[1].toLowerCase() === 'src' && attribute[2] !== undefined)
      if (!source) return tag
      const src = /^['"]/.test(source[2]) ? source[2].slice(1, -1) : source[2]
      return tag.slice(0, source.index) + ` src="${bg}" data-lazy-src="${src}"` + tag.slice(source.index + source[0].length)
    })
  }).join('')
}

hexo.extend.filter.register('after_render:html', data => {
  const { enable, field } = hexo.theme.config.lazyload
  if (!enable || field !== 'site') return data
  return lazyload(data)
})

hexo.extend.filter.register('after_post_render', data => {
  const { enable, field } = hexo.theme.config.lazyload
  if (!enable || field !== 'post') return data
  data.content = lazyload(data.content)
  return data
})
