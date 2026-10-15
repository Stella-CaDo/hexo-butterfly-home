/* Keyboard and focus support around nanogallery2's original viewer controls. */
;(function () {
  'use strict'
  var dialog = null
  var opener = null
  var inertElements = []
  var closeRequested = false
  var labels = { previous: '上一张照片', next: '下一张照片', close: '关闭大图', zoomIn: '放大', zoomOut: '缩小', fullScreen: '切换全屏' }

  function restore () {
    inertElements.forEach(function (entry) { entry.element.inert = entry.inert })
    inertElements = []
    dialog = null
    closeRequested = false
    if (opener && opener.isConnected) opener.focus({ preventScroll: true })
  }

  function prepare () {
    var viewer = document.querySelector('.nGY2ViewerContainer')
    if (!viewer) { if (dialog) restore(); return }
    if (!document.getElementById('gallery-mosaic')) return
    if (dialog !== viewer) {
      dialog = viewer
      viewer.dataset.imageReady = 'false'
      opener = document.activeElement
      viewer.setAttribute('role', 'dialog')
      viewer.setAttribute('aria-modal', 'true')
      viewer.setAttribute('aria-label', '照片大图浏览')
      document.querySelectorAll('#body-wrap, #rightside').forEach(function (element) {
        inertElements.push({ element: element, inert: element.inert })
        element.inert = true
      })
    }
    viewer.querySelectorAll('[data-ngy2action]').forEach(function (control) {
      var label = labels[control.getAttribute('data-ngy2action')]
      if (!label) return
      control.setAttribute('role', 'button')
      control.setAttribute('tabindex', '0')
      control.setAttribute('aria-label', label)
      control.title = label
    })
    viewer.querySelectorAll('img.nGY2ViewerMedia').forEach(function (image) {
      var original = Array.from(document.querySelectorAll('.vg-gallery a')).find(function (photo) { return photo.href === image.src })
      if (original) image.alt = original.querySelector('img').alt
    })
    var close = viewer.querySelector('[data-ngy2action="close"]')
    if (close && !viewer.contains(document.activeElement)) close.focus({ preventScroll: true })
  }

  function requestClose () {
    closeRequested = true
    if (dialog && dialog.dataset.imageReady === 'true') {
      window.jQuery('#gallery-mosaic').nanogallery2('closeViewer')
    }
  }

  function handleClose (event) {
    if (!dialog || !event.target.closest('[data-ngy2action="close"]')) return false
    event.preventDefault()
    event.stopImmediatePropagation()
    requestClose()
    return true
  }

  // The vendor handles touchstart separately and ignores an immediate close.
  // Use the same pending-close handling for touch and mouse activation.
  document.addEventListener('touchstart', handleClose, { capture: true, passive: false })
  document.addEventListener('click', function (event) {
    if (handleClose(event)) return
    var thumbnail = event.target.closest('.gallery-mosaic [data-photo-id]')
    if (thumbnail) thumbnail.focus({ preventScroll: true })
  }, true)

  document.addEventListener('keydown', function (event) {
    if (!dialog) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopImmediatePropagation()
      requestClose()
    } else if (event.key === 'Tab') {
      var controls = Array.from(dialog.querySelectorAll('[tabindex="0"]')).filter(function (element) { return element.getClientRects().length > 0 })
      var index = controls.indexOf(document.activeElement)
      if (!controls.length) return
      event.preventDefault()
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus()
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-ngy2action]')) {
      event.preventDefault()
      event.target.click()
    }
  }, true)

  document.addEventListener('keyup', function (event) {
    if (dialog && (event.key === 'Enter' || event.key === ' ') && event.target.closest('[role="button"]')) {
      // Prevent the vendor's global shortcut from starting a slideshow after button activation.
      event.stopImmediatePropagation()
    }
  }, true)

  // The library appends/removes the dialog directly under body.
  new MutationObserver(prepare).observe(document.body, { childList: true })
  document.addEventListener('gallery:image-displayed', function () {
    prepare()
    if (dialog) {
      dialog.dataset.imageReady = 'true'
      if (closeRequested) requestClose()
    }
  })
  document.addEventListener('pjax:send', restore)
})()
