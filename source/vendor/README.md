# Gallery dependencies

These assets are self-hosted and loaded only on photo album pages.

- nanogallery2 3.0.5, Christophe Brisbois: https://github.com/nanostudio-org/nanogallery2
  - npm tarball: https://registry.npmjs.org/nanogallery2/-/nanogallery2-3.0.5.tgz
  - GPLv3: `nanogallery2/GPL-3.0.txt`. Upstream notices are preserved in the JavaScript and CSS files.
  - License text obtained from SPDX's GPL-3.0-only data via spdx-license-list 6.12.0.
  - Corresponding unminified source: `nanogallery2/jquery.nanogallery2.core.source.txt` and `nanogallery2/css/nanogallery2.source.txt`. Text copies are served without Hexo's JavaScript/CSS minification.
  - Only the core distribution is used; external photo-provider modules are omitted.
- jQuery 3.7.1, OpenJS Foundation and contributors: https://github.com/jquery/jquery
  - npm tarball: https://registry.npmjs.org/jquery/-/jquery-3.7.1.tgz
  - MIT license: `jquery/LICENSE.txt`. Unminified source: `jquery/jquery.js`.

Local adaptation lives in `/js/vg-gallery.js`, `/js/gallery-accessibility.js` and `/css/vg-gallery.css`. No upstream code is modified.
