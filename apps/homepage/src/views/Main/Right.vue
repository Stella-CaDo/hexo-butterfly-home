<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <!-- 移动端 Logo -->
    <div class="logo">
      <span class="bg">{{ profile.name }}</span>
      <span class="sm"> · {{ profile.englishName }}</span>
    </div>
    <!-- 功能区 -->
    <Func />
    <!-- 网站链接 -->
    <Link />
  </div>
</template>

<script setup>
import { mainStore } from '@/store';
import { profile } from '@/profile';
import Func from '@/views/Func/index.vue';
import Link from '@/components/Links.vue';
const store = mainStore();
</script>

<style lang="scss" scoped>
.right {
  // flex: 1 0 0%;
  width: 50%;
  margin-left: 0.75rem;
  .logo {
    width: 100%;
    font-family: inherit;
    font-size: 2.25rem;
    position: relative; margin-bottom: 28px;
    top: 6%;
    left: 0;
    text-align: center;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    @media (min-width: 721px) {
      display: none;
    }
    @media (max-height: 720px) {
      width: calc(100% + 6px);
      top: 43.26px; // 721px * 0.06
    }
    @media (max-width: 390px) {
        width: 100%;
    }
  }
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    &.hidden {
      display: none;
    }
  }
}
</style>
