<template>
  <div class="music-controls">
    <button type="button" aria-label="上一首" :disabled="disabled" @click="music.step(-1)"><GoStart theme="filled" fill="currentColor" /></button>
    <button type="button" class="play" :aria-label="music.playing ? '暂停音乐' : '播放音乐'" :disabled="disabled" @click="music.toggle()">
      <Pause v-if="music.playing" theme="filled" fill="currentColor" /><PlayOne v-else theme="filled" fill="currentColor" />
    </button>
    <button type="button" aria-label="下一首" :disabled="disabled" @click="music.step(1)"><GoEnd theme="filled" fill="currentColor" /></button>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { GoStart, GoEnd, PlayOne, Pause } from '@icon-park/vue-next';
import { musicStore } from '@/store/music';
const music = musicStore();
const disabled = computed(() => music.loading || !music.current);
</script>
<style scoped>
.music-controls { display:flex; align-items:center; justify-content:center; gap:12px; }
button { background:transparent; display:grid; place-items:center; width:44px; height:44px; border-radius:50%; padding:0; }
button:hover { background:#ffffff20; }
button:disabled { opacity:.4; cursor:default; }
.i-icon { display:flex; font-size:28px; }
.play { width:52px; height:52px; }
.play .i-icon { font-size:42px; }
</style>
