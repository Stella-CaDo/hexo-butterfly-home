'use strict'

// Keep installed dependency corrections reproducible after npm install.
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const root = path.resolve(__dirname, '..')

function dependency (name, version) {
  const directory = path.join(root, 'node_modules', name)
  const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
  if (installed.version !== version) {
    throw new Error(`${name} ${installed.version}: review the compatibility fix before using this version (tested: ${version}).`)
  }
  return directory
}

function replaceChecked (text, original, replacement, count, label) {
  if (text.split(replacement).length - 1 === count) return text
  if (text.split(original).length - 1 !== count) throw new Error(`${label}: expected source pattern changed; no files were written.`)
  return text.split(original).join(replacement)
}

function prepare () {
  const theme = dependency('hexo-theme-butterfly', '5.5.4')
  const swiper = dependency('hexo-butterfly-swiper', '1.0.12')
  const themeFile = path.join(theme, 'scripts', 'filters', 'post_lazyload.js')
  const themeOriginal = fs.readFileSync(themeFile, 'utf8')
  if (!themeOriginal.includes("'after_render:html'") || !themeOriginal.includes("'after_post_render'")) throw new Error('Butterfly lazyload registration changed; review the compatibility fix.')
  const themeReplacement = fs.readFileSync(path.join(__dirname, 'hexo-compat', 'butterfly-lazyload.js'), 'utf8')

  const swiperFile = path.join(swiper, 'index.js')
  const swiperOriginal = fs.readFileSync(swiperFile, 'utf8')
  const swiperReplacement = replaceChecked(swiperOriginal,
    "var item_html = '${temple_html_text}';",
    "var item_html = ${JSON.stringify(temple_html_text).replace(/</g, '\\\\u003c')};",
    1, 'Swiper HTML serialization')

  const templateFile = path.join(swiper, 'lib', 'html.pug')
  const templateOriginal = fs.readFileSync(templateFile, 'utf8')
  let templateReplacement = replaceChecked(templateOriginal,
    'onerror=`this.src=` + error_img + `; this.onerror = null;`',
    'onerror=`this.src=${JSON.stringify(error_img)}; this.onerror = null;`',
    2, 'Swiper image error handler')
  templateReplacement = replaceChecked(templateReplacement,
    "onclick=`pjax.loadUrl(\"` + item.path + `\");` href='javascript:void(0);'",
    "onclick=`pjax.loadUrl(\"/` + item.path.split('/').filter(Boolean).join('/') + `\"); return false;` href='/' + item.path.split('/').filter(Boolean).join('/')",
    3, 'Swiper root-relative PJAX article links')
  for (const className of ['img', 'title', 'button']) {
    templateReplacement = replaceChecked(templateReplacement,
      `a.blog-slider__${className}(href=item.path`,
      `a.blog-slider__${className}(href='/' + item.path.split('/').filter(Boolean).join('/')`,
      1, 'Swiper root-relative article links without PJAX: ' + className)
  }

  new vm.Script(themeReplacement)
  new vm.Script(swiperReplacement)
  require('pug').compile(templateReplacement)

  // Validate all replacements before changing any dependency source.
  for (const [file, original, replacement] of [
    [themeFile, themeOriginal, themeReplacement],
    [swiperFile, swiperOriginal, swiperReplacement],
    [templateFile, templateOriginal, templateReplacement]
  ]) {
    if (original !== replacement) {
      fs.writeFileSync(file, replacement)
      console.log('[Hexo compatibility] updated ' + path.relative(root, file))
    }
  }
  console.log('[Hexo compatibility] Butterfly 5.5.4 and swiper 1.0.12 fixes verified')
}

try { prepare() } catch (error) {
  console.error('[Hexo compatibility] ' + error.message)
  process.exitCode = 1
}
