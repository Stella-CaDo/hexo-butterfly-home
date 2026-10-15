<template>
  <div class="music-card cards" aria-label="主页音乐播放器">
    <template v-if="music.showCard">
      <div class="card-links"><button type="button" @click="music.openList()">音乐列表</button><button type="button" @click="music.showCard = false">随手记录</button></div>
      <MusicControls />
      <p v-if="music.loading" class="song-name" role="status">正在加载歌单…</p>
      <p v-else class="song-name" :title="title">{{ music.current ? title : '暂无歌曲，请先配置本地歌单' }}</p>
      <label class="volume"><span>音量</span><input aria-label="主页音乐音量" type="range" min="0" max="1" step="0.01" :value="music.volume" @input="music.setVolume($event.target.value)" /></label>
    </template>
    <template v-else>
      <button class="return-music" type="button" @click="music.showCard = true">打开音乐播放器</button>
      <Hitokoto />
    </template>
    <div v-if="music.error" class="music-error" role="status">{{ music.error }} <button v-if="!music.songs.length" type="button" @click="music.load()">重试</button></div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { musicStore } from '@/store/music';
import MusicControls from '@/components/MusicControls.vue';
import Hitokoto from '@/components/Hitokoto.vue';
const music = musicStore();
const title = computed(() => music.current ? `${music.current.name} · ${music.current.artist}` : '');
</script>
<style scoped lang="scss">
.music-card { height:100%; min-height:165px; padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between; position:relative; }
.card-links { display:flex; align-items:center; justify-content:space-between; gap:8px; }
button { background:transparent; padding:6px; font-size:12px; min-height:30px; }
.song-name { font-size:13px; margin:0; line-height:1.5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
.volume { display:flex; align-items:center; justify-content:center; gap:8px; font-size:11px; }
input { width:90px; height:20px; accent-color:#efefef; }
.return-music { position:absolute; top:4px; right:6px; z-index:1; }
:deep(.hitokoto) { padding:28px 8px 8px; background:transparent; }
:deep(.hitokoto .text), :deep(.hitokoto .from) { font-size:14px; }
.music-error { font-size:12px; line-height:1.5; padding-top:8px; }
</style>
