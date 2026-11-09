<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getTopics, type Topic } from '@/requests/blog'
import BlogCard from './BlogCard.vue'

const props = defineProps<{
  /** 标签筛选 id 列表：变化时回到第一页重新加载（由父级筛选器驱动） */
  tagIds: number[]
}>()

const pageSize = 5
const topics = ref<Topic[]>([])
/** 初始加载态：v-loading 遮罩整个列表 */
const loading = ref(false)
/** 加载更多进行中：按钮 loading */
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(0)
/** 请求序号：筛选快速切换时丢弃过期响应，避免旧数据覆盖新结果 */
let filterReqSeq = 0

/** append=false 整页替换（首屏/筛选变化），true 追加（加载更多） */
const loadTopics = async (targetPage: number, append = false) => {
  const seq = ++filterReqSeq
  if (append) loadingMore.value = true
  else loading.value = true
  error.value = ''
  try {
    loading.value = true
    const { items, pagination } = await getTopics(targetPage, pageSize, {
      tagIds: props.tagIds,
    })
    if (seq !== filterReqSeq) return // 过期响应，丢弃
    if (append) topics.value.push(...items)
    else topics.value = items
    page.value = pagination.page
    totalPages.value = pagination.totalPages
  } catch (e) {
    if (seq === filterReqSeq) {
      error.value = e instanceof Error ? e.message : '加载失败，请稍后重试'
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => loadTopics(page.value + 1, true)

// 筛选条件变化 → 重载第一页
watch(() => props.tagIds, () => loadTopics(1))

onMounted(() => loadTopics(1))
</script>

<template>
  <section v-loading="loading" class="blog-list">
    <p v-if="error" class="blog-list__empty blog-list__empty--error">{{ error }}</p>
    <p v-else-if="!loading && topics.length === 0" class="blog-list__empty">还没有文章，敬请期待～</p>

    <template v-else>
      <ul class="blog-list__list">
        <li v-for="topic in topics" :key="topic.id">
          <BlogCard :topic="topic" />
        </li>
      </ul>
      <!-- 还有下一页时展示加载更多按钮（链接样式，图标开头） -->
      <div v-if="page < totalPages" class="blog-list__more">
        <ElButton link :loading="loadingMore" @click="loadMore">
          <ElIcon><ArrowDown /></ElIcon>
          加载更多
        </ElButton>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.blog-list {

  &__empty {
    padding: 80px 0;
    text-align: center;
    color: var(--color-text-soft);

    &--error {
      color: var(--color-danger, #ff4d4f);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__more {
    display: flex;
    justify-content: center;
    padding-top: 8px;
  }
  .blog-list__more {
    margin-top: 16px;
    .el-icon {
      margin-right: 5px;
    }
  }
}
</style>
