import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = { VITE_SITE_NAME: '我的主页', VITE_SITE_AUTHOR: '站点作者', VITE_SITE_KEYWORDS: '个人主页,博客', VITE_SITE_DES: '个人主页和博客示例', VITE_SITE_START: '2026-01-01', ...loadEnv(mode, process.cwd(), 'VITE_') };
  return {
  // Keep bundled assets at a stable path shared by the root page and preview route.
  base: '/home-assets/',
  plugins: [vue(), { name: 'public-site-metadata', transformIndexHtml: { order: 'pre', handler: html => html.replace(/%VITE_([A-Z_]+)%/g, (_, key) => String(env['VITE_' + key] || '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]))) } }],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  css: { preprocessorOptions: { scss: { additionalData: '@use "@/style/global.scss" as *;' } } },
  server: { host: '127.0.0.1', port: 4175, strictPort: true, open: false },
  preview: { host: '127.0.0.1', port: 4175, strictPort: true },
  build: { sourcemap: false },
};
});
