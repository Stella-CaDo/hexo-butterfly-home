<template>
  <!-- 功能区域 -->
  <div :class="store.mobileFuncState ? 'function mobile' : 'function'">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="left">
          <MusicCard />
          
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right cards">
          <div class="time">
            <div class="date">
              <span>{{ currentTime.year }}&nbsp;年&nbsp;</span>
              <span>{{ currentTime.month }}&nbsp;月&nbsp;</span>
              <span>{{ currentTime.day }}&nbsp;日&nbsp;</span>
              <span class="sm-hidden">{{ currentTime.weekday }}</span>
            </div>
            <div class="text">
              <span> {{ currentTime.hour }}:{{ currentTime.minute }}:{{ currentTime.second }}</span>
            </div>
          </div>
          <Weather />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getCurrentTime } from '@/utils/getTime';
import { mainStore } from '@/store';
import MusicCard from '@/components/MusicCard.vue';
import Weather from '@/components/Weather.vue';
const store = mainStore();
const currentTime = ref(getCurrentTime());
let interval;
const update = () => { currentTime.value = getCurrentTime(); };
const resume = () => { clearInterval(interval); update(); if (!document.hidden) interval = setInterval(update, 1000); };
onMounted(() => { resume(); document.addEventListener('visibilitychange', resume); });
onBeforeUnmount(() => { clearInterval(interval); document.removeEventListener('visibilitychange', resume); });
</script>

<style lang="scss" scoped>
.function {
  min-height: 165px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  &.mobile {
    .el-row {
      .el-col {
        &:nth-of-type(1) {
          display: contents;
        }
        &:nth-of-type(2) {
          display: none;
        }
      }
    }
  }
  .el-row {
    height: 100%;
    width: 100%;
    margin: 0 !important;
    .el-col {
      &:nth-of-type(1) {
        padding-left: 0 !important;
      }
      &:nth-of-type(2) {
        padding-right: 0 !important;
      }
    }
    .left,
    .right {
      width: 100%;
      min-height: 165px;
    }
    .right {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      animation: fade 0.5s;
      .time {
        font-size: 1.1rem;
        text-align: center;
        .date {
          text-overflow: ellipsis;
          overflow-x: hidden;
          white-space: nowrap;
        }
        .text {
          margin-top: 10px;
          font-size: clamp(2rem, 3.4vw, 3.25rem);
          letter-spacing: 2px;
          font-family: ui-monospace, monospace;
        }
        @media (min-width: 1201px) and (max-width: 1280px) {
          font-size: 1rem;
        }
        @media (min-width: 911px) and (max-width: 992px) {
          font-size: 1rem;
          .text {
            font-size: 2.5rem;
          }
        }
      }
      .weather {
        text-align: center;
        width: 100%;
        white-space: normal;
        font-size: 0.9rem;
        line-height: 1.5;
      }
    }
  }
}
@media (max-width: 1100px) {
  .function {
    .el-row { gap: 12px; }
    .el-row .el-col { flex: none; max-width: none; width: 100%; padding: 0 !important; }
  }
}
</style>
