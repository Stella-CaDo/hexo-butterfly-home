!(function () {
  'use strict';

  /* ======================================================
     文章页标签上移
     将 .post-meta__tag-list 移到 #post-meta 的最顶部，
     显示在日期 / 分类信息之前（与 noionion.top 风格一致）
  ====================================================== */
  function initPostTagsToTop() {
    var tagList = document.querySelector('.post-meta__tag-list');
    var postMeta = document.getElementById('post-meta');
    if (!tagList || !postMeta) return;
    var firstLine = postMeta.querySelector('.meta-firstline');
    if (firstLine) {
      postMeta.insertBefore(tagList, firstLine);
    } else {
      postMeta.insertBefore(tagList, postMeta.firstChild);
    }
  }

  /* ======================================================
     入口：DOMContentLoaded 后执行，pjax 跳转后重新执行
  ====================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initPostTagsToTop();
  });

  document.addEventListener('pjax:complete', function () {
    initPostTagsToTop();
  });
})();
