<template>
<section class="box cards" aria-label="更多个人介绍">
  <button class="close-button" @click="close">关闭介绍</button>
  <div class="content"><TimeCapsule /><MoreContent /></div>
</section>
</template>

<script setup>
import { mainStore } from '@/store';
import TimeCapsule from '@/components/TimeCapsule.vue';
import MoreContent from '@/components/MoreContent.vue';
const store = mainStore();
const close = () => { store.boxOpenState = false; document.querySelector('.description')?.focus(); };
</script>

<style lang="scss" scoped>
.close-button { position: absolute; top: 10px; right: 14px; background: #0007; border-radius: 6px; padding: 8px 12px; min-height:44px; }
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: auto;
  max-width: 50%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    transition:
      transform 0.3s,
      opacity 0.3s;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .setting {
    right: 56px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 64px 28px 24px;
    width: 100%;
    height: 100%;
  }
}
</style>
