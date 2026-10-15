import { defineStore } from 'pinia';

export const mainStore = defineStore('blog-template-home', {
  state: () => ({
    imgLoadStatus: true,
    innerWidth: 0,
    backgroundShow: false,
    boxOpenState: false,
    mobileOpenState: false,
    mobileFuncState: false,
    siteStartShow: false,
    reduceMotion: false,
  }),
  getters: { getInnerWidth: state => state.innerWidth },
  actions: {
    setInnerWidth(value) {
      this.innerWidth = value;
      if (value > 720) this.mobileOpenState = false;
    },
    setImgLoadStatus(value) { this.imgLoadStatus = value; },
  },
});
