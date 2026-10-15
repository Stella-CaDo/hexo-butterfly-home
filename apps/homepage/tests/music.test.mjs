import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlaylist, musicPath, parseLrc, lyricAt, shuffleIndices, formatTime } from '../src/utils/music.js';

test('Music accepts existing local paths and rejects external URLs and encoded traversal', () => {
  assert.equal(musicPath('/music/audio/001.mp3','audio'), '/music/audio/001.mp3');
  for (const value of ['https://other.test/001.mp3', '//other.test/001.mp3', '/music/audio/../x', '/music/audio/%2e%2e/x', '/music/audio/a%5cb', '/music/audio/a?x=1']) assert.equal(musicPath(value,'audio'), '');
  assert.deepEqual(normalizePlaylist([{name:'本地歌曲',url:'/music/audio/001.mp3',cover:'https://other.test/a.jpg',lrc:'/music/lrc/001.lrc'},{url:'https://other.test/a.mp3'},null]), [{name:'本地歌曲',artist:'未知歌手',url:'/music/audio/001.mp3',cover:'',lrc:'/music/lrc/001.lrc'}]);
  assert.throws(() => normalizePlaylist({songs:[]}), /格式/);
});

test('LRC supports multiple timestamps, stable ordering, offset and plain text', () => {
  const lines = parseLrc('[ar:歌手]\n[offset:100]\n[00:03.00]下一句\n[00:01.20][00:02.20]<b>原样文本</b>\n[00:04.00]');
  assert.equal(lines.length,4);
  assert.equal(lyricAt(lines,0),'');
  assert.equal(lyricAt(lines,1.3),'<b>原样文本</b>');
  assert.equal(lyricAt(lines,3.5),'下一句');
  assert.equal(lyricAt(lines,5),'');
  assert.deepEqual(parseLrc('无时间轴歌词'),[]);
});

test('Random order visits all songs once, retains current song, and supports empty/single lists', () => {
  for(let attempt=0;attempt<20;attempt++) {
    const order=shuffleIndices(46,13);
    assert.equal(order[0],13);
    assert.equal(new Set(order).size,46);
    assert.deepEqual([...order].sort((a,b)=>a-b),Array.from({length:46},(_,i)=>i));
  }
  assert.deepEqual(shuffleIndices(0,0),[]);
  assert.deepEqual(shuffleIndices(1,0),[0]);
});

test('Existing word-timed local lyrics display whole lines and omit timing metadata', () => {
  const lines = parseLrc('[00:00.00]Para[00:00.45] Para[00:00.91] Sakura[00:02.00]\n[00:00.00](0,2000)[00:02.00]\n[00:03.00]如[00:03.40]樱花[00:04.00]\n[00:03.00]yu ying fa[00:04.00]');
  assert.deepEqual(lines, [{time:0,text:'Para Para Sakura'},{time:3,text:'如樱花'}]);
  assert.equal(lyricAt(lines,3.5),'如樱花');
});

test('Time display tolerates audio metadata not loaded yet', () => {
  for(const value of [NaN,Infinity,-1]) assert.equal(formatTime(value),'00:00');
  assert.equal(formatTime(125.9),'02:05');
});
