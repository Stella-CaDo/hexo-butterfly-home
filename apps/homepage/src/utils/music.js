// Only the existing same-origin music library is accepted by the homepage.
export function musicPath(value, folder) {
  if (typeof value !== 'string' || !value.startsWith(`/music/${folder}/`)) return '';
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { return ''; }
  if (/[\\?#\u0000-\u001f]/.test(decoded) || decoded.split('/').some(part => part === '..' || part === '.')) return '';
  return value;
}

export function normalizePlaylist(value) {
  if (!Array.isArray(value)) throw new Error('歌单格式不正确');
  return value.flatMap(song => {
    const url = musicPath(song?.url, 'audio');
    if (!url) return [];
    return [{ name: String(song.name || song.title || '未命名歌曲'), artist: String(song.artist || song.author || '未知歌手'),
      url, cover: musicPath(song.cover || song.pic, 'covers'), lrc: musicPath(song.lrc, 'lrc') }];
  });
}

export function parseLrc(text) {
  const offset = Number(text.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const lines = [], used = new Set();
  for (const line of text.split(/\r?\n/)) {
    // Local files include word timing and phonetic lines. Keep one readable line
    // at each starting timestamp, rather than treating each word as a new line.
    const prefix = line.match(/^(?:\[\d+:\d{1,2}(?:\.\d+)?\])+/)?.[0] || '';
    const stamps = [...prefix.matchAll(/\[(\d+):(\d{1,2}(?:\.\d+)?)\]/g)];
    const content = line.slice(prefix.length).replace(/\[[^\]]*\]/g, '').trim();
    if (/^(?:\(\d+,\d+\)\s*)+$/.test(content)) continue;
    for (const stamp of stamps) {
      const time = Math.max(0, Number(stamp[1]) * 60 + Number(stamp[2]) + offset);
      if (!used.has(time)) { lines.push({ time, text: content }); used.add(time); }
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function lyricAt(lines, time) {
  let text = '';
  for (const line of lines) { if (line.time > time) break; text = line.text; }
  return text;
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export function shuffleIndices(length, current) {
  const order = Array.from({ length }, (_, index) => index).filter(index => index !== current);
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  return length ? [current, ...order] : [];
}
