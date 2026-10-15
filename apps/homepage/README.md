# Homepage

Based on imsyy/home (MIT). Preserve `LICENSE` and upstream attribution.

Source is in `src/`, profile and navigation data in `profile.json`, public metadata examples in `.env.example`. All `VITE_` values are public. Neutral SVG assets are under `public/`; original-site photos, icons and fonts are not included.

From repository root:

```sh
npm --prefix apps/homepage ci
npm --prefix apps/homepage test
npm run build
```

The full build copies Vite output into Hexo-owned `source/index.html` and `source/home-assets/`. Root `public/` is generated output, while this directory's `public/` contains tracked source assets.

Same-origin music is read from `/music/playlist.json`; the public template starts with an empty list. There is no independent player page. Run the complete site for music integration; a standalone Vite server does not serve Hexo content. Autoplay is off. Seeking requires a Range-capable static server.
