import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { lyricAt, normalizePlaylist, parseLrc, shuffleIndices } from '@/utils/music';

const preferenceKey = 'blog-template-home:music';
export const musicStore = defineStore('blog-template-home-music', () => {
  const songs = ref([]), index = ref(0), loading = ref(false), error = ref('');
  const playing = ref(false), waiting = ref(false), currentTime = ref(0), duration = ref(0);
  const volume = ref(0.7), order = ref('random'), loop = ref('all');
  const listOpen = ref(false), showCard = ref(true), lyric = ref('');
  const current = computed(() => songs.value[index.value] || null);
  let media, lyricRequest, lines = [], queue = [], pending, selection = 0;
  const lyrics = new Map();

  function savePreferences() {
    try { localStorage.setItem(preferenceKey, JSON.stringify({ volume: volume.value, order: order.value, loop: loop.value })); } catch { /* Storage is optional. */ }
  }
  function attach(element) {
    media = element;
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
      if (typeof saved.volume === 'number' && Number.isFinite(saved.volume)) volume.value = Math.max(0, Math.min(1, saved.volume));
      if (['random', 'list'].includes(saved.order)) order.value = saved.order;
      if (['all', 'one', 'none'].includes(saved.loop)) loop.value = saved.loop;
    } catch { /* Invalid preferences use defaults. */ }
    media.volume = volume.value;
    return load();
  }
  async function load() {
    if (pending) return pending;
    loading.value = true; error.value = '';
    pending = (async () => {
      try {
        const response = await fetch('/music/playlist.json', { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('歌单暂时无法加载，请重试');
        songs.value = normalizePlaylist(await response.json());
        if (!songs.value.length) { queue = []; return; }
        queue = shuffleIndices(songs.value.length, 0);
        await select(0, false);
      } catch (cause) { error.value = cause.message || '歌单加载失败，请重试'; }
      finally { loading.value = false; pending = null; }
    })();
    return pending;
  }
  async function loadLyrics(song, token) {
    lyricRequest?.abort(); lines = []; lyric.value = '';
    if (!song.lrc) return;
    if (lyrics.has(song.lrc)) { lines = lyrics.get(song.lrc); return; }
    const controller = new AbortController(); lyricRequest = controller;
    try {
      const response = await fetch(song.lrc, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
      if (!response.ok) return;
      const parsed = parseLrc(await response.text());
      if (token === selection) { lines = parsed; lyrics.set(song.lrc, parsed); }
    } catch { /* Missing lyrics do not prevent audio playback. */ }
  }
  async function select(value, shouldPlay = true) {
    if (!media || !songs.value[value]) return;
    const token = ++selection;
    media.pause(); index.value = value; currentTime.value = 0; duration.value = 0; error.value = '';
    media.src = current.value.url; media.load();
    void loadLyrics(current.value, token);
    if (shouldPlay) await play();
  }
  async function play() {
    if (!media || !current.value) return;
    error.value = '';
    try { await media.play(); }
    catch (cause) {
      if (cause.name === 'AbortError') return;
      playing.value = false; waiting.value = false;
      error.value = cause.name === 'NotAllowedError' ? '请点击播放按钮开始播放' : '这首歌曲暂时无法播放，请重试或切换歌曲';
    }
  }
  function toggle() { if (playing.value) media?.pause(); else void play(); }
  function step(direction = 1) {
    if (!songs.value.length) return;
    const indices = order.value === 'random' ? queue : songs.value.map((_, position) => position);
    const position = indices.indexOf(index.value);
    const next = indices[(position + direction + indices.length) % indices.length];
    void select(next);
  }
  function ended() {
    if (loop.value === 'one') { media.currentTime = 0; void play(); return; }
    const indices = order.value === 'random' ? queue : songs.value.map((_, position) => position);
    if (loop.value === 'none' && indices.at(-1) === index.value) { playing.value = false; return; }
    step(1);
  }
  function updateTime() {
    currentTime.value = Number.isFinite(media?.currentTime) ? media.currentTime : 0;
    lyric.value = lyricAt(lines, currentTime.value);
  }
  function updateDuration() { duration.value = Number.isFinite(media?.duration) ? media.duration : 0; }
  function seek(value) {
    const seconds = Number(value);
    if (media && duration.value > 0 && Number.isFinite(seconds)) {
      media.currentTime = Math.max(0, Math.min(duration.value, seconds)); updateTime();
    }
  }
  function setVolume(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    volume.value = Math.max(0, Math.min(1, number));
    if (media) media.volume = volume.value;
    savePreferences();
  }
  function setOrder(value) {
    if (!['random', 'list'].includes(value)) return;
    order.value = value; queue = shuffleIndices(songs.value.length, index.value); savePreferences();
  }
  function setLoop(value) {
    if (['all', 'one', 'none'].includes(value)) { loop.value = value; savePreferences(); }
  }
  function failed() { playing.value = false; waiting.value = false; error.value = '这首歌曲暂时无法播放，请重试或切换歌曲'; }
  function openList() { showCard.value = true; listOpen.value = true; }
  function dispose() { ++selection; lyricRequest?.abort(); media?.pause(); media = null; }
  return { songs, index, current, loading, error, playing, waiting, currentTime, duration, volume, order, loop,
    listOpen, showCard, lyric, attach, load, select, toggle, step, ended, updateTime, updateDuration, seek,
    setVolume, setOrder, setLoop, failed, openList, dispose };
});
