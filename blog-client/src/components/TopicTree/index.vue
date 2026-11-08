<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElTree } from 'element-plus'
import { getBlogTree, type Topic } from '@/requests/blog'

const props = defineProps<{
  /** 当前选中的博客 id：既是树数据请求入参，也是高亮依据 */
  id: number
}>()

/** select：用户点击某篇博客，交由父组件更新公共 id；
 *  loaded：树加载完成后回传专题名，供父级顶栏展示 */
const emit = defineEmits<{
  (e: 'select', blogId: number): void
  (e: 'loaded', payload: { rootTitle: string }): void
}>()

/** el-tree 节点结构（label/children 是 el-tree 的默认字段名） */
type TreeNode = { id: number; label: string; children: TreeNode[] }

const loading = ref(true)
const error = ref('')
const treeData = ref<TreeNode[]>([])
/** 当前专题根 id：作为 el-tree 的 :key，切换专题时整树重建、默认全部展开 */
const rootId = ref<number | null>(null)

/** 平铺 blogs（根 + 后代）按 parent_id 组出嵌套树 */
function buildTree(blogs: Topic[], rootId: number): TreeNode {
  const byId = new Map(blogs.map((b) => [b.id, b]))
  const childrenOf = new Map<number, number[]>()
  for (const b of blogs) {
    if (b.parent_id === null) continue
    const ids = childrenOf.get(b.parent_id) ?? []
    ids.push(b.id)
    childrenOf.set(b.parent_id, ids)
  }
  const build = (id: number): TreeNode | null => {
    const blog = byId.get(id)
    if (!blog) return null
    return {
      id: blog.id,
      label: blog.title,
      children: (childrenOf.get(id) ?? [])
        .map((childId) => build(childId))
        .filter((n): n is TreeNode => n !== null),
    }
  }
  return build(rootId) ?? { id: rootId, label: '', children: [] }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const tree = await getBlogTree(props.id)
    rootId.value = tree.rootId
    treeData.value = [buildTree(tree.blogs, tree.rootId)]
    const root = tree.blogs.find((b) => b.id === tree.rootId)
    emit('loaded', { rootTitle: root?.title ?? '' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '目录加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })

/** 点击节点：把博客 id 交给父组件更新公共 id */
const onNodeClick = (node: TreeNode) => {
  emit('select', node.id)
}
</script>

<template>
  <aside class="topic-tree">
    <p v-if="loading" class="topic-tree__empty">加载中…</p>
    <p v-else-if="error" class="topic-tree__empty topic-tree__empty--error">{{ error }}</p>
    <ElTree
      v-else
      :key="rootId ?? 0"
      class="topic-tree__tree"
      :data="treeData"
      node-key="id"
      default-expand-all
      highlight-current
      :current-node-key="props.id"
      :expand-on-click-node="false"
      @node-click="onNodeClick"
    />
  </aside>
</template>

<style scoped>
/* 目录：无边框无底色；高度跟随右侧内容窗口（网格列拉伸），
   条目过多时自身内部滚动，不把页面撑高 */
.topic-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 20px 8px 0;
  min-height: 0;
  overflow-y: auto;
}

.topic-tree__empty {
  padding: 24px 0;
  font-size: 14px;
  text-align: center;
  color: var(--color-text-soft);
}

.topic-tree__empty--error {
  color: var(--color-danger, #ff4d4f);
}

/* el-tree 主题定制：悬停/当前节点用全局主题色 */
.topic-tree__tree {
  background: transparent;
  --el-tree-node-hover-bg-color: var(--color-accent-soft);
}

.topic-tree__tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 6px;
}

.topic-tree__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  font-weight: 500;
}
</style>
