<template>
  <audio ref="audio" preload="metadata" @play="music.playing = true" @pause="music.playing = false"
    @timeupdate="music.updateTime()" @durationchange="music.updateDuration()" @loadedmetadata="music.updateDuration()"
    @ended="music.ended()" @error="music.failed()" @waiting="music.waiting = true" @playing="music.waiting = false" />
  <dialog ref="dialog" class="music-dialog" aria-labelledby="music-dialog-title" @close="music.listOpen = false" @click="dismissBackdrop" @keydown="trapFocus">
    <header><h2 id="music-dialog-title">音乐列表 <small>{{ music.songs.length }} 首</small></h2><button type="button" class="close" aria-label="关闭音乐列表" @click="music.listOpen = false"><CloseOne theme="outline" fill="currentColor" /></button></header>
    <div class="now-playing">
      <img :src="music.current?.cover || asset('images/avatar.svg')" alt="" width="64" height="64" @error="coverFallback" />
      <div><p class="track-title">{{ music.current?.name || '本地音乐' }}</p><p class="artist">{{ music.current?.artist || '暂无歌曲，请先配置本地歌单' }}</p></div>
    </div>
    <MusicControls />
    <div class="progress"><span>{{ formatTime(music.currentTime) }}</span><input aria-label="播放进度" type="range" min="0" :max="music.duration || 0" step="0.1" :value="music.currentTime" :disabled="!music.duration" @input="music.seek($event.target.value)" /><span>{{ formatTime(music.duration) }}</span></div>
    <div class="preferences">
      <label>顺序 <select aria-label="播放顺序" :value="music.order" @change="music.setOrder($event.target.value)"><option value="random">随机</option><option value="list">顺序</option></select></label>
      <label>循环 <select aria-label="循环模式" :value="music.loop" @change="music.setLoop($event.target.value)"><option value="all">列表循环</option><option value="one">单曲循环</option><option value="none">不循环</option></select></label>
      <label class="volume">音量 <input aria-label="音乐列表音量" type="range" min="0" max="1" step="0.01" :value="music.volume" @input="music.setVolume($event.target.value)" /></label>
    </div>
    <p class="lyric">{{ music.lyric || (music.waiting ? '正在缓冲…' : '选一首喜欢的歌吧') }}</p>
    <p v-if="music.error" class="error" role="status">{{ music.error }} <button v-if="!music.songs.length" type="button" @click="music.load()">重试</button></p>
    <ol class="tracks" aria-label="本地歌单">
      <li v-for="(song, index) in music.songs" :key="song.url"><button type="button" :aria-current="music.index === index ? 'true' : undefined" @click="music.select(index)"><span class="number">{{ index + 1 }}</span><span class="name">{{ song.name }}</span><span class="artist">{{ song.artist }}</span></button></li>
    </ol>
  </dialog>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { CloseOne } from '@icon-park/vue-next';
import { musicStore } from '@/store/music';
import { asset } from '@/profile';
import { formatTime } from '@/utils/music';
import MusicControls from '@/components/MusicControls.vue';
const music = musicStore(), audio = ref(null), dialog = ref(null);
let previousOverflow = '';
function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.value.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)')].filter(element => element.getClientRects().length);
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
function dismissBackdrop(event) {
  if (event.target !== dialog.value) return;
  const box = dialog.value.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) music.listOpen = false;
}
function coverFallback(event) {
  if (event.target.dataset.fallback) return;
  event.target.dataset.fallback = 'true'; event.target.src = asset('images/avatar.svg');
}
function shortcut(event) {
  if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('button, a, input, select, textarea, [contenteditable="true"], [role="button"]')) return;
  if (!music.current || music.loading) return;
  event.preventDefault(); music.toggle();
}
watch(() => music.listOpen, open => {
  if (open) { previousOverflow = document.documentElement.style.overflow; dialog.value.showModal(); document.documentElement.style.overflow = 'hidden'; }
  else { dialog.value.close(); document.documentElement.style.overflow = previousOverflow; }
}, { flush: 'post' });
onMounted(() => { void music.attach(audio.value); window.addEventListener('keydown', shortcut); });
onBeforeUnmount(() => { music.dispose(); window.removeEventListener('keydown', shortcut); if (music.listOpen) document.documentElement.style.overflow = previousOverflow; });
</script>
<style scoped lang="scss">
.music-dialog { --music-panel:#242830; --music-text:#efefef; border:1px solid #ffffff30; border-radius:12px; background:var(--music-panel); color:var(--music-text); padding:20px; width:min(560px, calc(100vw - 32px)); max-height:calc(100dvh - 40px); margin:auto; box-shadow:0 20px 64px #0008; overflow:auto; }
.music-dialog::backdrop { background:#0009; backdrop-filter:blur(8px); }
header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; }
h2 { font-size:18px; margin:0; } small { font-size:12px; font-weight:normal; margin-left:8px; opacity:.75; }
button { background:transparent; } .close { width:44px; height:44px; display:grid; place-items:center; font-size:26px; border-radius:50%; }
.now-playing { display:flex; align-items:center; gap:16px; margin-bottom:12px; } .now-playing div { min-width:0; }
img { border-radius:8px; object-fit:cover; flex-shrink:0; } .track-title { font-size:16px; line-height:1.5; margin:0 0 4px; overflow-wrap:anywhere; }
.artist { font-size:12px; opacity:.75; } p.artist { margin:0; }
.progress { display:flex; align-items:center; gap:12px; font-size:11px; margin:8px 0 12px; font-variant-numeric:tabular-nums; }
input { accent-color:var(--music-text); height:32px; min-width:0; } .progress input { flex:1; }
.preferences { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; font-size:12px; }
label { display:flex; align-items:center; gap:8px; } select { background:var(--music-panel); color:var(--music-text); border:1px solid #ffffff40; border-radius:4px; padding:6px 4px; min-height:36px; }
.volume input { width:72px; } .lyric { text-align:center; font-size:13px; line-height:1.6; min-height:22px; margin:12px 0; overflow-wrap:anywhere; }
.error { font-size:13px; line-height:1.6; } .error button { text-decoration:underline; }
.tracks { list-style:none; padding:0; margin:0; max-height: min(36dvh, 320px); overflow:auto; border-top:1px solid #ffffff20; }
.tracks button { display:flex; width:100%; align-items:center; text-align:left; gap:12px; padding:12px 8px; min-height:44px; border-radius:4px; }
.tracks button:hover, .tracks button[aria-current] { background:#ffffff15; }
.tracks button[aria-current] { box-shadow:inset 3px 0 var(--music-text); }
.number { width:24px; flex-shrink:0; font-size:12px; opacity:.6; } .name { flex:1; font-size:13px; overflow-wrap:anywhere; } .tracks .artist { max-width:32%; text-align:right; overflow-wrap:anywhere; }
.standalone { display:block; margin-top:16px; text-align:right; font-size:12px; text-underline-offset:4px; }
@media(max-width:400px) { .music-dialog { padding:16px; } .preferences { gap:8px; } .volume { width:100%; } .volume input { flex:1; } }
</style>
