<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { DArrowRight } from '@element-plus/icons-vue'
import SectionTitle from '@/components/SectionTitle.vue'
import type { Topic } from '@/requests/blog'

const props = withDefaults(defineProps<{
  title: string
  /** 数据源由使用方提供 */
  loadData: (arg: { page: number; pageSize: number }) => Promise<Topic[]>
  /** 是否分页（分页时展示"加载更多"） */
  paginated?: boolean
  pageSize?: number
}>(), {
  paginated: true,
  pageSize: 10,
})

/** renderItem 插槽：Item 内容模板由使用方（Blogs/index.vue）提供 */
defineSlots<{
  renderItem(props: { topic: Topic; index: number }): any
}>()

const items = ref<Topic[]>([])
const page = ref(1)
const loadingMore = ref(false)
const hasMore = ref(false)

const load = async (targetPage: number, append = false) => {
  if (append) loadingMore.value = true
  try {
    const list = await props.loadData({ page: targetPage, pageSize: props.pageSize })
    if (append) items.value.push(...list)
    else items.value = list
    page.value = targetPage
    // 返回条数不足一页说明已到末页
    hasMore.value = props.paginated && list.length >= props.pageSize
  } catch (e) {
    // 侧栏失败静默，不阻塞主列表
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => load(page.value + 1, true)

onMounted(() => load(1))
</script>

<template>
  <section class="side-panel" :aria-label="title">
    <SectionTitle :title="title" />
    <p v-if="items.length === 0" class="side-panel__empty">暂无数据</p>
    <ul v-else class="side-panel__list">
      <li class="side-panel__item-wrapper" v-for="(topic, index) in items" :key="topic.id">
        <RouterLink
          :to="`/blogs/${topic.id}`"
          target="_blank"
          rel="noopener"
          class="side-panel__item"
        >
          <div class="sider-panel__item-content">     
            <!-- Item 内容模板由使用方通过 renderItem 插槽提供，尾部箭头由本组件统一渲染 -->
          <slot  name="renderItem" :topic="topic" :index="index" /></div>
     
          <ElIcon class="side-panel__arrow" :size="12"><DArrowRight /></ElIcon>
        </RouterLink>
      </li>
    </ul>
    <ElButton
      v-if="paginated && hasMore"
      class="side-panel__more"
      text
      :loading="loadingMore"
      @click="loadMore"
    >
      加载更多
    </ElButton>
  </section>
</template>

<style lang="scss" scoped>
.side-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 16px;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);

  &__empty {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-soft);
  }

  &__list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // Item 链接外壳：flex 行、hover 点亮；内容由 renderItem 插槽填充
  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--color-text);
    text-decoration: none;
    transition: var(--transition-base);
    .sider-panel__item-content {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    &:hover {
      color: var(--color-accent);
      background: var(--color-accent-soft);

      .side-panel__arrow {
        color: var(--color-accent);
      }
    }
  }

  // 尾部跳转箭头：默认浅色，hover 随 Item 点亮
  &__arrow {
    flex-shrink: 0;
    color: var(--color-text-soft);
  }

  &__more {
    flex-shrink: 0;
    align-self: center;
  }
}
</style>
