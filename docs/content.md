# 添加内容

## 首页

编辑 `apps/homepage/profile.json`。`profile` 是个人介绍，`siteLinks` 是导航，`socialLinks` 默认空。音乐图标为 `CompactDisc` 的导航项会打开内嵌音乐弹窗，不跳转到独立页面。

首页网页元信息在 Vite 配置中有通用默认值，可复制 `apps/homepage/.env.example` 为 `.env.local` 覆盖；VITE_ 变量公开可见。

## 音乐

默认 `source/music/playlist.json` 为 `[]`。一条歌单记录格式如下，仅演示路径，不包含实际音频：

```json
[
  {
    "name": "歌曲名称",
    "artist": "表演者",
    "url": "/music/audio/your-track.mp3",
    "cover": "/music/covers/your-cover.jpg",
    "lrc": "/music/lrc/your-track.lrc"
  }
]
```

媒体目录默认被 Git 忽略，请另行备份并按自己的发布方式上传。媒体必须存在且有使用权限；只使用同源路径。没有封面或歌词时可不填对应字段。网页不自动播放。

## 相册

编辑 `source/gallery/travel/index.md` 等页面，在 `.vg-gallery` 中添加 `figure`：

```html
<figure class="vg-item">
  <a target="_blank" rel="noopener" href="/gallery/photos/your-photo.webp"
     data-ngthumb="/gallery/photos/your-thumb.webp">
    <img class="no-lightbox" src="/gallery/photos/your-thumb.webp"
         alt="请填写真实的图片说明" loading="lazy">
  </a>
  <figcaption>请填写真实的图片说明</figcaption>
</figure>
```

将有权发布的图片放在相应位置后再构建。相册代码保留普通链接作为降级方案，并按需加载本地查看器。空相册不加载查看器依赖。照片可能含定位等元信息，发布前自行检查。

## 摘要

`data/ai-summaries.json` 包含一条明确标为人工编写的样式示例，正式模型生成的摘要不带该示例标志。更改示例文章、域名或模型设置后，示例缓存失效并隐藏。手动生成会替换相应缓存；未被改动的示例可直接删除其缓存条目。

不要把 `.env.ai.local`、聊天记录或私密文章加入公开仓库。生成摘要是单独的手动操作，构建和 CI 不请求模型。

## 首页轮播

轮播出现在 `/blog/`，仅展示 front matter 中设置了正数 `swiper_index` 的文章，数值越大越靠前。示例：

```yaml
swiper_index: 2
cover: /img/background.svg
description: 文章简要介绍
```

新文章不设置该字段就不会进入轮播。不要保留启用但没有任何标记文章的空轮播；需要时在 `_config.yml` 中关闭 `swiper.enable`。
