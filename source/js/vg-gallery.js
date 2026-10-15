/* nanogallery2 integration: local assets, progressive enhancement and PJAX lifecycle. */
;(function () {
  'use strict'
  var dependencies = null
  var active = null
  var activeKeyHandlers = []
  var desktopPattern = [
    { c: 1, r: 1, w: 2, h: 2 },
    { c: 3, r: 1, w: 2, h: 1 },
    { c: 3, r: 2, w: 1, h: 1 },
    { c: 4, r: 2, w: 1, h: 2 },
    { c: 1, r: 3, w: 3, h: 1 }
  ]
  var mobilePattern = [
    { c: 1, r: 1, w: 2, h: 2 },
    { c: 1, r: 3, w: 1, h: 1 },
    { c: 2, r: 3, w: 1, h: 2 },
    { c: 1, r: 4, w: 1, h: 1 },
    { c: 1, r: 5, w: 2, h: 1 }
  ]

  function loadScript (src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = function () { script.remove(); reject(new Error('Gallery script could not load: ' + src)) }
      document.head.appendChild(script)
    })
  }

  function loadStyle () {
    return new Promise(function (resolve, reject) {
      var existing = document.getElementById('gallery-vendor-style')
      if (existing) { resolve(); return }
      var link = document.createElement('link')
      link.id = 'gallery-vendor-style'
      link.rel = 'stylesheet'
      link.href = '/vendor/nanogallery2/css/nanogallery2.min.css'
      link.onload = resolve
      link.onerror = function () { link.remove(); reject(new Error('Gallery stylesheet could not load')) }
      document.head.appendChild(link)
    })
  }

  function loadDependencies () {
    if (!dependencies) {
      var scripts = window.jQuery ? Promise.resolve() : loadScript('/vendor/jquery/jquery.min.js')
      dependencies = Promise.all([
        loadStyle(),
        scripts.then(function () {
          if (!window.jQuery.fn.nanogallery2) return loadScript('/vendor/nanogallery2/jquery.nanogallery2.core.min.js')
        })
      ]).catch(function (error) { dependencies = null; throw error })
    }
    return dependencies
  }

  function destroy () {
    if (!active) return
    var gallery = active
    active = null
    window.jQuery(gallery).nanogallery2('closeViewer')
    // Also clean up a viewer whose vendor opening tween has not finished yet.
    document.querySelectorAll('.nGY2ViewerContainer').forEach(function (viewer) { viewer.remove() })
    document.body.classList.remove('nGY2_body_scrollbar')
    var scrollbarStyle = document.getElementById('nGY2_body_scrollbar_style')
    if (scrollbarStyle) scrollbarStyle.remove()
    window.jQuery(gallery).nanogallery2('destroy')
    // Upstream 3.0.5 leaves its unnamespaced document keyup listener on destroy.
    activeKeyHandlers.forEach(function (handler) { window.jQuery(document).off('keyup', handler) })
    activeKeyHandlers = []
    gallery.remove()
  }

  function initialize () {
    var shell = document.querySelector('.gallery-shell[data-album]')
    if (!shell || shell.dataset.galleryState) return
    shell.dataset.galleryState = 'loading'
    var status = shell.querySelector('.gallery-status')
    status.textContent = '正在加载拼贴视图…'
    var fallback = shell.querySelector('.vg-gallery')
    var links = Array.from(fallback.querySelectorAll('a'))
    if (!links.length) {
      status.textContent = '这个相册暂时没有照片。'
      shell.dataset.galleryState = 'empty'
      return
    }
    loadDependencies().then(function () {
      if (!shell.isConnected) return
      var mount = document.createElement('div')
      mount.id = 'gallery-mosaic'
      mount.className = 'gallery-mosaic'
      mount.setAttribute('aria-label', shell.dataset.album + '照片')
      fallback.before(mount)
      active = mount
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      var previousKeyHandlers = ((window.jQuery._data(document, 'events') || {}).keyup || []).map(function (event) { return event.handler })
      window.jQuery(mount).nanogallery2({
        items: links.map(function (link, index) {
          return { id: String(index + 1), src: link.getAttribute('href'), srct: link.getAttribute('data-ngthumb') || link.getAttribute('href'), title: link.querySelector('img').alt }
        }),
        thumbnailWidth: '240 XS160 SM200 ME240 LA280 XL320',
        thumbnailHeight: '180 XS130 SM160 ME180 LA200 XL220',
        galleryMosaic: desktopPattern,
        galleryMosaicXS: mobilePattern,
        galleryMosaicSM: mobilePattern,
        thumbnailGutterWidth: 12,
        thumbnailGutterHeight: 12,
        thumbnailBorderHorizontal: 0,
        thumbnailBorderVertical: 0,
        thumbnailCrop: true,
        thumbnailLabel: { display: true, position: 'overImage', align: 'left', valign: 'bottom', displayDescription: false },
        thumbnailToolbarImage: { topLeft: '', topRight: '' },
        // An empty array means no effects; v3.0.5 parses '' as an invalid effect.
        thumbnailHoverEffect2: [],
        thumbnailDisplayTransition: reduceMotion ? 'none' : 'fadeIn',
        thumbnailDisplayTransitionDuration: reduceMotion ? 0 : 180,
        thumbnailDisplayInterval: 0,
        galleryDisplayTransition: 'none',
        galleryResizeAnimation: false,
        touchAnimation: false,
        touchAutoOpenDelay: 0,
        locationHash: false,
        displayBreadcrumb: false,
        viewerGallery: 'none',
        viewerHideToolsDelay: 0,
        viewerToolbar: { display: true, standard: 'label', minimized: 'label', autoMinimize: 0 },
        viewerTools: { topLeft: 'pageCounter', topRight: 'zoomButton,fullscreenButton,closeButton' },
        imageTransition: reduceMotion ? 'none' : 'swipe2',
        fnThumbnailInit: function ($thumbnail, item) {
          $thumbnail.attr({ role: 'button', tabindex: '0', 'aria-label': '查看照片：' + item.title, 'data-photo-id': item.GetID() })
        }
      })
      activeKeyHandlers = ((window.jQuery._data(document, 'events') || {}).keyup || []).map(function (event) { return event.handler }).filter(function (handler) { return previousKeyHandlers.indexOf(handler) === -1 })
      mount.addEventListener('keydown', function (event) {
        var thumbnail = event.target.closest('[data-photo-id]')
        if (!thumbnail || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        window.jQuery(mount).nanogallery2('displayItem', '0/' + thumbnail.dataset.photoId)
      })
      window.jQuery(mount).on('lightboxImageDisplayed.nanogallery2', function () {
        document.dispatchEvent(new Event('gallery:image-displayed'))
      })
      fallback.hidden = true
      status.textContent = ''
      shell.dataset.galleryState = 'ready'
    }).catch(function (error) {
      if (!shell.isConnected) return
      destroy()
      fallback.hidden = false
      status.textContent = '拼贴视图暂时无法加载，可点击下方照片查看原图。'
      shell.dataset.galleryState = 'fallback'
      shell.dataset.galleryError = error.message
      console.warn(error.message)
    })
  }

  document.addEventListener('pjax:send', destroy)
  document.addEventListener('pjax:complete', initialize)
  initialize()
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize)
})()
