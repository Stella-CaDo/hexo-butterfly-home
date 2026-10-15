import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCurrentTime, getTimeCapsule } from '../src/utils/getTime.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceFiles = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? sourceFiles(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const source = sourceFiles(path.join(root,'src')).map(p => readFileSync(p,'utf8')).join('\n');

test('Remote execution, HTML injection and service-worker paths stay absent; music fetches are local', () => {
  for(const pattern of [/fetchJsonp/,/XMLHttpRequest/,/sendBeacon/,/v-html\s*=/,/dangerouslyUseHTMLString/,/eval\s*\(/,/new Function/,/serviceWorker/,/api-meting/,/restapi\.amap/,/api\.oioweb/,/api\.vvhan/,/v1\.hitokoto/]) assert.doesNotMatch(source,pattern);
  const music = readFileSync(path.join(root,'src/store/music.js'),'utf8');
  assert.match(music, /fetch\('\/music\/playlist\.json'/);
  assert.doesNotMatch(music, /https?:\/\//);
});
test('Public profile has complete metadata and no private service defaults', () => {
  const settings = JSON.parse(readFileSync(path.join(root, 'profile.json'), 'utf8'));
  assert.ok(settings.profile.name);
  assert.equal(new URL(settings.profile.site).protocol, 'https:');
  assert.ok(Array.isArray(settings.siteLinks));
  for (const item of settings.siteLinks) if (item.icon !== 'CompactDisc') assert.match(item.link, /^\/(?!\/)/);
  assert.deepEqual(settings.socialLinks, []);
  assert.equal(settings.profile.icp, '');
});
test('Production document limits connections and scripts to same origin', () => {
  const html=readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes("script-src 'self'"));
  assert.ok(html.includes("connect-src 'self'"));
  assert.ok(html.includes("worker-src 'none'"));
  assert.ok(html.includes("media-src 'self'"));
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/);
});
test('Clock updates across local midnight and leap day', () => {
  assert.equal(getCurrentTime(new Date(2028,1,29,23,59,59)).day,'29');
  const next=getCurrentTime(new Date(2028,2,1,0,0,0));
  assert.equal(next.month,'03'); assert.equal(next.day,'01'); assert.equal(next.hour,'00'); assert.equal(next.second,'00');
});
test('Time capsule percentages remain bounded on year boundary and Monday', () => {
  for(const date of [new Date(2026,0,1),new Date(2026,8,28),new Date(2026,11,31,23,59,59)]) {
    for(const entry of Object.values(getTimeCapsule(date))) assert.ok(Number(entry.percentage)>=0 && Number(entry.percentage)<=100);
  }
  assert.equal(getTimeCapsule(new Date(2026,8,28)).week.passed,0);
});
