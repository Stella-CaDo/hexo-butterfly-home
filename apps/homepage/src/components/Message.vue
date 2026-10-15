<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <img class="logo-img" :src="siteLogo" :alt="profile.name + '的头像'" width="120" height="120" />
      <div class="name">
        <span class="bg">{{ profile.name }}</span>
        <span class="sm">{{ profile.englishName }}</span>
      </div>
    </div>
    <!-- 简介 -->
    <div class="description cards" :role="store.innerWidth > 720 ? 'button' : undefined" :tabindex="store.innerWidth > 720 ? 0 : undefined" :aria-expanded="store.boxOpenState" :aria-label="'关于' + profile.name + '，展开更多介绍'" @click="changeBox" @keydown.enter="changeBox" @keydown.space.prevent="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <Transition name="fade" mode="out-in">
          <div :key="descriptionText.hello + descriptionText.text" class="text">
            <p>{{ descriptionText.hello }}</p>
            <p>{{ descriptionText.text }}</p>
          </div>
        </Transition>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { Icon } from '@vicons/utils';
import { QuoteLeft, QuoteRight } from '@vicons/fa';
import { mainStore } from '@/store';
import { profile, asset } from '@/profile';
const store = mainStore();
const siteLogo = asset('images/avatar.svg');
const descriptionText = computed(() => store.boxOpenState
  ? { hello: profile.location, text: profile.interests + '。' + profile.motto }
  : { hello: 'Hello, ' + profile.name, text: profile.introduction });
const changeBox = () => { if (store.innerWidth > 720) store.boxOpenState = !store.boxOpenState; };

</script>

<style lang="scss" scoped>
.message {
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    animation: fade 0.5s;
    max-width: 460px;
    .logo-img {
      border-radius: 50%;
      width: 120px;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      flex-shrink: 0;
    }
    .name {
      width: 100%;
      padding-left: 22px;
      transform: translateY(-8px);
      font-family: inherit;

      .bg {
        font-size: clamp(2.8rem, 4.5vw, 4.5rem); font-family: system-ui, "Microsoft YaHei", sans-serif; font-weight: 600; letter-spacing: 4px;
      }

      .sm {
        display: block; margin-top: 8px; font-size: 1rem; font-family: monospace; letter-spacing: 4px;
        @media (min-width: 721px) and (max-width: 789px) {
          display: none;
        }
      }
    }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: auto;
        .bg {
          font-size: clamp(2rem, 8vw, 3.2rem);
        }
      }
    }

    @media (max-width: 720px) {
      max-width: 100%;
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: fade 0.5s;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;
        transition: opacity 0.2s;

        p {
          &:nth-of-type(1) {
            font-family: inherit;
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      pointer-events: none;
    }
  }
  // @media (max-width: 390px) {
  //   .logo {
  //     flex-direction: column;
  //     .logo-img {
  //       display: none;
  //     }
  //     .name {
  //       margin-left: 0;
  //       height: auto;
  //       transform: none;
  //       text-align: center;
  //       .bg {
  //         font-size: 3.5rem;
  //       }
  //       .sm {
  //         font-size: 1.4rem;
  //       }
  //     }
  //   }
  //   .description {
  //     margin-top: 2.5rem;
  //   }
  // }
}
</style>
