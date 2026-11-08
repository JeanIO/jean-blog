<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import TopicTree from '@/components/TopicTree/index.vue'
import RichText from './RichText.vue'

const route = useRoute()

/** 公共 id：树的选中状态与正文渲染都由它驱动，两个子组件 watch 它各自重新请求 */
const currentBlogId = ref(Number(route.params.blogId))
/** 专题名（树组件加载后回传，顶栏展示用） */
const rootTitle = ref('')

// 路由变化（新标签页直开 / 手动改 URL / 前进后退）时同步公共 id
watch(
  () => route.params.blogId,
  (v) => {
    const id = Number(v)
    if (id !== currentBlogId.value) currentBlogId.value = id
  },
)

/** 树中选中某篇博客：更新公共 id，两个子组件自行重新请求 */
const onSelect = (blogId: number) => {
  currentBlogId.value = blogId
}
</script>

<template>
  <main class="detail">
    <!-- 顶部：返回列表 + 专题名 -->
    <div class="detail__topbar">
      <RouterLink to="/blogs" class="detail__back">← 返回列表</RouterLink>
      <span v-if="rootTitle" class="detail__root-title">专题：{{ rootTitle }}</span>
    </div>

    <div class="detail__body">
      <TopicTree
        :id="currentBlogId"
        @select="onSelect"
        @loaded="rootTitle = $event.rootTitle"
      />
      <!-- class 透传到组件根节点，分割线/白底等布局样式由本页面负责 -->
      <RichText :id="currentBlogId" class="detail__content" />
    </div>
  </main>
</template>

<style scoped>
.detail {
  max-width: 1080px;
  margin: 0 auto;
  /* 高度 = 视口 - 固定头部：页面锁在首屏，内部区域各自滚动 */
  height: calc(100vh - 64px);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.detail__topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  flex-shrink: 0;
}

.detail__back {
  color: var(--color-text-soft);
  text-decoration: none;
  transition: var(--transition-base);
}

.detail__back:hover {
  color: var(--color-accent);
}

.detail__root-title {
  color: var(--color-heading);
  font-weight: 500;
}

.detail__body {
  display: grid;
  grid-template-columns: 240px 1fr;
  flex-grow: 1;
  /* 关键：允许网格子项在 flex 容器内收缩，内部滚动才能生效 */
  min-height: 0;
}

/* 正文区（作用在 RichText 根节点上）：与目录之间用垂直分割线分开
   固定白底（lake 渲染器是浅色主题，暗色模式下也保持白底阅读区）
   正文内部滚动：整页不滚，只有内容窗口自己滚 */
.detail__content {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 0 8px 32px;
  border-left: 1px solid var(--color-border);
  background: #fff;
}
</style>
