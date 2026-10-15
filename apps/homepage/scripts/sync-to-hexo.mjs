import { cp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(app, '../..');
const source = path.resolve(root, 'source');
const assetsDestination = path.resolve(source, 'home-assets');
const rootIndex = path.resolve(source, 'index.html');
if (path.relative(source, assetsDestination) !== 'home-assets' || rootIndex !== path.resolve(source, 'index.html')) throw new Error('Unexpected output directory');
const index = await readFile(path.join(app, 'dist/index.html'), 'utf8');
if (!index.includes('/home-assets/assets/') || !index.includes('Managed by apps/homepage/scripts/sync-to-hexo.mjs')) throw new Error('Homepage build output is missing the expected asset base or ownership marker');
if (index.includes('noindex')) throw new Error('The canonical root page must remain indexable');
try {
  const existing = await readFile(rootIndex, 'utf8');
  if (!existing.includes('Managed by apps/homepage/scripts/sync-to-hexo.mjs')) throw new Error('Refusing to overwrite an unmanaged source/index.html');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
// Replace only the verified, build-owned asset directory so obsolete Vite bundles disappear.
await rm(assetsDestination, { recursive: true, force: true });
await mkdir(assetsDestination, { recursive: true });
for (const entry of await readdir(path.join(app, 'dist'), { withFileTypes: true })) {
  if (entry.name === 'index.html') continue;
  await cp(path.join(app, 'dist', entry.name), path.join(assetsDestination, entry.name), { recursive: true, force: true });
}
await writeFile(rootIndex, `---\nlayout: false\n---\n${index}`);
console.log('Homepage synced to source/index.html and current home-assets; blog listing stays at /blog/.');
