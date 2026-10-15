'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const root = path.resolve(__dirname, '../..')
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 256 * 1024 * 1024, windowsHide: true })

function secrets () {
  const file = path.join(root, '.env.ai.local')
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap(line => {
    const match = line.match(/^\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*?)\s*$/)
    if (!match || !/(KEY|TOKEN|SECRET|PASSWORD)/.test(match[1])) return []
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
    return value.length >= 12 ? [Buffer.from(value)] : []
  })
}

function check () {
  const { spawnSync } = require('node:child_process')
  let files = git(['ls-files', '--stage', '-z']).toString('utf8').split('\0').filter(Boolean).map(line => {
    const match = line.match(/^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/)
    if (!match || match[3] !== '0') throw new Error('Resolve index conflicts before committing')
    return { id: match[2], name: match[4] }
  })
  const history = process.argv.includes('--history')
  if (history) {
    const objects = git(['rev-list', '--objects', 'HEAD']).toString('utf8').trim().split('\n')
    const types = spawnSync('git', ['cat-file', '--batch-check'], { cwd: root, input: objects.map(line => line.split(' ')[0]).join('\n') + '\n', encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true })
    if (types.status !== 0) throw new Error('Cannot inspect source history')
    const blobs = new Set(types.stdout.trim().split('\n').filter(line => line.split(' ')[1] === 'blob').map(line => line.split(' ')[0]))
    files = objects.filter(line => blobs.has(line.split(' ')[0])).map(line => ({ id: line.split(' ')[0], name: line.slice(line.indexOf(' ') + 1) }))
  }
  const known = secrets(), failures = []
  for (const file of files) {
    if (!history && (/^(?:public|node_modules|\.deploy[^/]*|backups|\.git|\.codex|\.agents)\//.test(file.name) || /(?:^|\/)\.env(?:\..*)?$/.test(file.name) && !/\.example$/.test(file.name) && file.name !== 'apps/homepage/.env')) failures.push({ file: file.name, reason: 'local or generated file is tracked' })
  }
  const ids = [...new Set(files.map(file => file.id))]
  const result = spawnSync('git', ['cat-file', '--batch'], { cwd: root, input: ids.join('\n') + '\n', maxBuffer: 256 * 1024 * 1024, windowsHide: true })
  if (result.status !== 0) throw new Error('Cannot inspect staged Git objects')
  let offset = 0, bytes = 0, largest = 0
  for (const id of ids) {
    const end = result.stdout.indexOf(10, offset)
    const header = result.stdout.subarray(offset, end).toString('ascii').split(' ')
    if (header[0] !== id || header[1] !== 'blob') throw new Error('Unexpected index object')
    const size = Number(header[2]), body = result.stdout.subarray(end + 1, end + 1 + size)
    bytes += size; largest = Math.max(largest, size); offset = end + 1 + size + 1
    const names = files.filter(file => file.id === id).map(file => file.name)
    let reason
    if (size >= 100 * 1024 * 1024) reason = 'file is too large for ordinary GitHub source backup'
    else if (known.some(secret => body.includes(secret))) reason = 'contains the locally configured model credential'
    else if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bsk-[a-f0-9]{32,}\b/.test(body.toString('utf8'))) reason = 'resembles a private credential; inspect locally'
    if (reason) failures.push({ files: names, reason })
  }
  const report = { date: new Date().toISOString(), scope: history ? 'HEAD history' : 'index', files: files.length, uniqueBytes: bytes, largestFileBytes: largest, failures }
  if (process.argv.includes('--report')) {
    fs.mkdirSync(path.join(root, 'docs/version-control'), { recursive: true })
    fs.writeFileSync(path.join(root, `docs/version-control/${history ? 'history' : 'index'}-audit.json`), JSON.stringify(report, null, 2) + '\n')
  }
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exitCode = 1
}
try { check() } catch (error) { console.error(error.message); process.exitCode = 1 }
