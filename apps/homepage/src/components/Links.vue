<template>
  <nav class="links" id="site-navigation" aria-label="网站导航">
    <div class="line"><Icon size="20"><Link /></Icon><span>网站列表</span></div>
    <div class="link-all">
      <template v-for="item in siteLinks" :key="item.name">
        <button v-if="item.icon === 'CompactDisc'" class="item cards" type="button" aria-haspopup="dialog" @click="music.openList()"><Icon size="26"><CompactDisc /></Icon><span>{{ item.name }}</span></button>
        <a v-else class="item cards" :href="item.link"><Icon size="26"><component :is="siteIcon[item.icon]" /></Icon><span>{{ item.name }}</span></a>
      </template>
    </div>
  </nav>
</template>
<script setup>
import { Icon } from '@vicons/utils';
import { Link, Blog, CompactDisc, Images, Image, User } from '@vicons/fa';
import { siteLinks } from '@/profile';
import { musicStore } from '@/store/music';
const music = musicStore();
const siteIcon = { Link, Blog, CompactDisc, Images, Image, User };
</script>
<style scoped lang="scss">
.line { display:flex; align-items:center; gap:8px; margin:2rem .25rem 1rem; font-size:1.15rem; }
.link-all { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
.item { display:flex; align-items:center; justify-content:center; gap:8px; min-height:100px; padding:12px 8px; font-size:1.1rem; text-decoration:none;
  &:hover { background:#0009; transform:scale(1.02); color:white; text-decoration:none; }
}
@media(max-width:900px) { .link-all {gap:12px;} .item { flex-direction:column; min-height:90px; font-size:1rem; } }
</style>
