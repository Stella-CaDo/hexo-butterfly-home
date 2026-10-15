<template><div class="more-content"><h2>关于 {{ profile.name }}</h2><p>{{ profile.interests }}</p><p>{{ profile.motto }}</p><p>{{ profile.quote }}</p><a href="/about/">阅读完整介绍</a></div></template>
<script setup>import { profile } from '@/profile';</script>
<style scoped>.more-content{margin-top:24px;line-height:1.9}.more-content h2{font-size:18px;margin-bottom:12px}.more-content a{display:inline-block;margin-top:12px;text-decoration:underline}</style>
