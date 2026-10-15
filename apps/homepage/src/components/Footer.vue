<template>
<footer id="footer" class="blur">
<div v-if="music.playing && music.lyric" class="lrc"><Transition name="fade" mode="out-in"><span :key="music.lyric" class="lrc-text">{{ music.lyric }}</span></Transition></div>
<div v-else class="power">
  <span>© {{ profile.copyrightSince }} - {{ fullYear }} <a href="/">{{ profile.name }}</a></span>
  <span> · <a :href="asset('UPSTREAM-LICENSE.txt')">基于 imsyy/home · MIT</a></span>
  <span> · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">{{ profile.icp }}</a></span>
</div></footer>
</template>

<script setup>
import { profile, asset } from '@/profile';
import { musicStore } from '@/store/music';
const music = musicStore();
const fullYear = new Date().getFullYear();
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: relative;
  bottom: 0;
  left: 0;
  min-height: 46px; height: auto; padding: 8px 20px;
  line-height: 1.8;
  text-align: center;
  z-index: 0;
  font-size: 14px;
  // 文字不换行
  word-break: keep-all;
  white-space: normal;
  .power {
    animation: fade 0.3s;
  }
  .lrc {
    padding: 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .lrc-all {
      width: 98%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .lrc-text {
        margin: 0 8px;
      }
      .i-icon {
        width: 18px;
        height: 18px;
        display: inherit;
      }
    }
  }
  &.blur {
    backdrop-filter: blur(10px);
    background: rgb(0 0 0 / 25%);
    font-size: 16px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  @media (max-width: 720px) {
    font-size: 0.9rem;
    &.blur {
      font-size: 0.9rem;
    }
  }
  @media (max-width: 560px) {
    .c-hidden {
      display: none;
    }
  }
  @media (max-width: 480px) {
    .hidden {
      display: none;
    }
  }
}
</style>
