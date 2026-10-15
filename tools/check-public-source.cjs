'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
if (!files.length) throw new Error('No tracked files; stage the reviewed source before checking.');
const failures = [];
for (const file of files) {
  if (/^(?:public|node_modules|backups|\.deploy[^/]*|source\/home-assets)\//.test(file) || file === 'source/index.html' || file === '_config.local.yml') failures.push({ file, reason: 'generated or local-only file' });
  if (/(?:^|\/)\.env(?:\..*)?$/.test(file) && !/\.example$/.test(file)) failures.push({ file, reason: 'non-example environment file' });
  const full = path.join(root, file);
  if (fs.lstatSync(full).isSymbolicLink()) { failures.push({ file, reason: 'review symbolic link before publishing' }); continue; }
  const data = fs.readFileSync(full);
  if (data.length >= 100 * 1024 * 1024) failures.push({ file, reason: 'oversized source file' });
  if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bsk-[a-f0-9]{32,}\b|git@[0-9]{1,3}\./.test(data.toString('utf8'))) failures.push({ file, reason: 'credential or personal deployment pattern' });
}
console.log(JSON.stringify({ files: files.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
