<template>
<div :class="store.backgroundShow ? 'cover show' : 'cover'" aria-hidden="true">
  <img v-if="!failed" :src="asset('images/background.svg')" class="bg" alt="" @error="failed = true" />
  <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
</div>
</template>

<script setup>
import { ref } from 'vue';
import { mainStore } from '@/store';
import { asset } from '@/profile';
const store = mainStore();
const failed = ref(false);
</script>

<style lang="scss" scoped>
.cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s; background: #20242b; pointer-events: none;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: brightness(.8);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade .6s;
    
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
