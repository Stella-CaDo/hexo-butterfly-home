# Repository guidance

- Hexo and Butterfly build a static blog; Vue/Vite homepage source is under `apps/homepage/`.
- Edit source and config, not root generated `public/`. `apps/homepage/public/` holds source assets and must stay tracked.
- Run `npm ci` and `npm --prefix apps/homepage ci`, then `npm test` and `npm run build`.
- Run `npm run check:source`; when Git has staged files, also run `node tools/versioning/check-index.cjs`.
- Do not call paid model APIs or deploy unless the user explicitly requests it. Build/tests use local data and mock responses.
- Keep example data generic; do not add personal links, real contact details, credentials or unsupported claims.
- Root homepage uses `/`, article listing `/blog/`. Root-domain hosting is supported; project subpaths require further work.
- Preserve all third-party licenses and notices, including imsyy/home MIT, Butterfly Apache-2.0 and nanogallery2 GPLv3.
- Configuration changes affecting assets/routes must be checked against the generated page and browser interactions.
- Music uses same-origin media without autoplay. Verify seeking only on a Range-capable server.
