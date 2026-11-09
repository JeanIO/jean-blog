<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { ElIcon } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import { getBlogDetail, type Topic } from '@/requests/blog'
import { formatDate } from '@/utils/date'
// lake 渲染器脚本 / React / antd 样式均由 index.html 全局加载（window.Doc 直接可用）

const props = defineProps<{
  /** 文章 id：id 变化时重新请求详情并重建 viewer */
  id: number
}>()

const detail = ref<Topic | null>(null)
const loading = ref(true)
const error = ref('')

const viewerContainerRef = ref<HTMLElement | null>(null)
let viewerInstance: any = null

/** 在容器上创建 lake viewer 并渲染正文 */
async function initViewer(content: string) {
  if (!viewerContainerRef.value) await nextTick()
  const { createOpenViewer } = (window as any).Doc
  // 切换文章时容器因 :key 变化整体重建，这里始终在全新容器上创建
  viewerInstance = createOpenViewer(viewerContainerRef.value, {
    // 左栏已有专题目录，不需要 viewer 自带的文章大纲
    toc: { enable: true },
    image: {
      onClick: (info: any) => {
        // 预留：后续可接图片预览
        console.log('图片被点击', info)
      },
    },
  })
  viewerInstance.setDocument('text/lake', content)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await getBlogDetail(props.id)
    // 先结束 loading 让正文容器真正挂载到 DOM，再初始化 viewer
    // （viewer 是 React 渲染器，拿不到真实 DOM 节点会报 "Cannot set properties of null"）
    loading.value = false
    await nextTick()
    await initViewer(detail.value.content)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败，请稍后重试'
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })
</script>

<template>
  <article class="rich-text">
    <p v-if="loading" class="rich-text__empty">加载中…</p>
    <p v-else-if="error" class="rich-text__empty rich-text__empty--error">{{ error }}</p>

    <template v-else-if="detail">
      <header class="rich-text__header">
        <h1 class="rich-text__title">{{ detail.title }}</h1>
        <div class="rich-text__meta">
          <span class="rich-text__views" title="阅读次数">
            <ElIcon :size="14"><View /></ElIcon>
            {{ detail.view_times }}
          </span>
          <span>更新于 {{ formatDate(detail.update_date) }}</span>
        </div>
        <div class="rich-text__tags">
          <span
            v-for="tag in detail.tags"
            :key="tag.id"
            class="tag-chip"
            :style="{ color: tag.color, backgroundColor: tag.color + '1a' }"
          >{{ tag.name }}</span>
        </div>
      </header>
      <!-- lake viewer 容器：切换文章用 :key 重建，viewer 每次都建在全新节点上 -->
      <div
        :key="props.id"
        ref="viewerContainerRef"
        class="rich-text__viewer"
      />
    </template>
  </article>
</template>

<style scoped>
.rich-text {
  min-height: 200px;
}

.rich-text__empty {
  padding: 80px 0;
  font-size: 14px;
  text-align: center;
  color: var(--color-text-soft);
}

.rich-text__empty--error {
  color: var(--color-danger, #ff4d4f);
}

/* 头部元信息（固定浅色主题配色，正文区始终白底） */
.rich-text__header {
  padding-bottom: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(60, 60, 60, 0.12);
}

.rich-text__title {
  margin: 0 0 12px;
  font-size: 28px;
  color: #2c3e50;
}

.rich-text__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
  font-size: 13px;
  color: rgba(60, 60, 60, 0.55);
}

.rich-text__views {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.rich-text__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  font-size: 12px;
  line-height: 1;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
</style>
