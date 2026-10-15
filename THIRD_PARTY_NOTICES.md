# Third-party notices

The root MIT license applies to original contributions and the neutral SVG/example content. It does not replace the licenses of third-party components. Keep existing copyright notices when reusing this project.

| Component | Version / source | License and included material |
| --- | --- | --- |
| Homepage base | imsyy/home, adaptation based on commit `869cf47e9a41eac0839828f39cbc0a535d5c3a5b` | MIT, copyright 2022 imsyy; `apps/homepage/LICENSE` and `apps/homepage/public/UPSTREAM-LICENSE.txt`. Adapted to local profile data, same-origin media and current Vue/Vite dependencies. |
| Butterfly | 5.5.4, npm dependency `hexo-theme-butterfly` | Apache-2.0, `licenses/Butterfly-Apache-2.0.txt`. Compatibility filter replacement is documented in `tools/hexo-compat/README.md`; original dependency source is installed by npm. |
| hexo-butterfly-swiper | 1.0.12, https://github.com/Akilarlxh/hexo-butterfly-swiper | Apache-2.0; bundled adapter assets and provenance under `source/vendor/blog-slider/`. Installed package is patched for safe HTML serialization, image fallback and root-relative links. |
| Swiper | 4.1.6, Vladimir Kharlampidi | MIT, headers preserved in bundled JS/CSS; full text `source/vendor/blog-slider/LICENSE-SWIPER-MIT.txt`. |
| jQuery | 3.7.1, OpenJS Foundation and contributors | MIT, license and unminified source in `source/vendor/jquery/`. |
| nanogallery2 | 3.0.5, Christophe Brisbois, https://github.com/nanostudio-org/nanogallery2 | GPLv3. Full license, unminified corresponding JS/CSS and served `.source.txt` copies in `source/vendor/nanogallery2/`. Vendor implementation is not modified. See `source/vendor/README.md`. |

Other npm dependencies retain the licenses supplied in their installed packages; lockfiles identify exact versions. Dependency installation and a root MIT license do not override those licenses.

No original-site music, photos, social icons, binary fonts or cursor themes are redistributed. The included SVGs are neutral template assets. Content you add later needs its own redistribution permission.
