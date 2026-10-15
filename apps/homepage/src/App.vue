<template>
  <Background />
  <main id="main" :class="{ 'reduced-motion': store.reduceMotion }">
    <div class="container" v-show="!store.backgroundShow">
      <section class="all">
        <MainLeft />
        <MainRight v-show="!store.boxOpenState" />
        <Box v-if="store.boxOpenState" />
      </section>
    </div>
    <div class="page-controls">
      <button class="utility cards" @click="store.backgroundShow = !store.backgroundShow" :aria-pressed="store.backgroundShow">{{ store.backgroundShow ? '返回主页' : '查看壁纸' }}</button>
      <button class="utility cards" @click="store.reduceMotion = !store.reduceMotion" :aria-pressed="store.reduceMotion">{{ store.reduceMotion ? '动效已减少' : '减少动效' }}</button>
    </div>
    <button v-show="!store.backgroundShow" class="menu cards" @click="store.mobileOpenState = !store.mobileOpenState" :aria-expanded="store.mobileOpenState" aria-controls="site-navigation">{{ store.mobileOpenState ? '返回介绍' : '网站导航' }}</button>
    <Footer v-show="!store.backgroundShow" />
  </main>
  <MusicPlayer />
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { mainStore } from '@/store';
import Background from '@/components/Background.vue';
import MainLeft from '@/views/Main/Left.vue';
import MainRight from '@/views/Main/Right.vue';
import Box from '@/views/Box/index.vue';
import Footer from '@/components/Footer.vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
import { musicStore } from '@/store/music';

const store = mainStore();
const music = musicStore();
const getWidth = () => { store.setInnerWidth(window.innerWidth); };
const closeOnEscape = event => {
  if (event.key === 'Escape') {
    if (music.listOpen) return;
    store.boxOpenState = false;
    store.backgroundShow = false;
    document.querySelector('.description')?.focus();
  }
};
watch(() => store.reduceMotion, value => {
  document.documentElement.classList.toggle('reduce-motion', value);
  try { localStorage.setItem('blog-template-home:reduce-motion', String(value)); } catch { /* Optional preference only. */ }
});
onMounted(() => {
  getWidth();
  store.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { store.reduceMotion ||= localStorage.getItem('blog-template-home:reduce-motion') === 'true'; } catch { /* Works without storage. */ }
  window.addEventListener('resize', getWidth);
  window.addEventListener('keydown', closeOnEscape);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', getWidth);
  window.removeEventListener('keydown', closeOnEscape);
});
</script>

<style lang="scss" scoped>
#main { min-height: 100dvh; width: 100%; display: flex; flex-direction: column; animation: fade .45s;
  .container { width: 100%; margin: auto; padding: 80px 24px 42px; flex: 1; display: flex; align-items: center; }
  .all { display: flex; align-items: center; justify-content: center; width: 100%; gap: 28px; }
  .page-controls { position: fixed; top: 20px; right: 24px; display: flex; gap: 10px; z-index: 3; }
  .utility { padding: 10px 14px; font-size: 13px; min-height: 44px; }
  .menu { display: none; }
  @media(max-width: 720px) {
    .container { padding: 100px 24px 20px; min-height: 620px; }
    .all { display: block; }
    .menu { display: block; margin: 16px auto 28px; padding: 12px 24px; min-height: 44px; }
    .page-controls { right: 16px; top: 16px; }
  }
}
</style>
