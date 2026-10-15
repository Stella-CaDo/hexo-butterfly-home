# Hexo compatibility fixes

`tools/fix-hexo-compat.js` applies checked, idempotent source corrections to the installed dependencies. Public-template build and server scripts invoke the compatibility tool explicitly; dependency lifecycle scripts are disabled. No generated `public/` HTML is patched.

Tested dependency versions:

- hexo-theme-butterfly 5.5.4
- hexo-butterfly-swiper 1.0.12

Corrections:

1. Butterfly's native and deferred image lazyload filters preserve complete script/style blocks and HTML comments. Image attributes in actual page markup retain lazyloading behavior. The replacement filter source is `butterfly-lazyload.js` in this directory.
2. Swiper's injected HTML is serialized with `JSON.stringify`, with `<` escaped for safe embedding inside a script element. Quotes, newlines and a literal closing script tag in content cannot break the injected JavaScript.
3. Both Swiper Pug template branches quote the fallback image URL in their `onerror` handler.
4. Swiper article links use root-relative URLs in both template branches, so moving the article listing to `/blog/` does not produce `/blog/2026/...` links. PJAX links retain a usable `href`.

The compatibility tools live outside Hexo's automatically loaded `scripts/` directory to avoid duplicate filter registration. All replacement source is validated before dependency files are written. Repeated runs make no further changes.

Run manually with `node tools/fix-hexo-compat.js` if using Hexo commands directly after installing dependencies with lifecycle scripts disabled. Restart an existing Hexo server to discard previously loaded module/filter code.

When upgrading either dependency, review these corrections and update the supported-version checks. An unreviewed version produces a clear error instead of silently applying an incompatible source patch.
