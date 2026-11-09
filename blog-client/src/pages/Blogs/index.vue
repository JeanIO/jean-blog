<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElIcon, ElOption, ElSelect } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import { getAllTags, getHotBlogs, getTopics, type ClientTag, type Topic } from '@/requests/blog'
import { formatDate } from '@/utils/date'
import BlogList from './components/BlogList.vue'
import SideList from './components/SideList.vue'

/** —— 标题栏标签筛选器 —— */
const allTags = ref<ClientTag[]>([])
const selectedTagIds = ref<number[]>([])

const onTagFilterChange = (ids: number[]) => {
  selectedTagIds.value = ids
}

/** —— 侧栏数据源：由本页面提供给 SideList —— */
/** 热门榜：单页取前 N（无翻页） */
const loadHotData = ({ pageSize }: { page: number; pageSize: number }): Promise<Topic[]> => {
  return getHotBlogs(pageSize)
}

/** 专题列表：所有根博客，分页 */
const loadTopicData = ({ page, pageSize }: { page: number; pageSize: number }): Promise<Topic[]> => {
  return getTopics(page, pageSize, { rootOnly: true }).then((r) => r.items)
}

onMounted(() => {
  getAllTags().then((tags) => (allTags.value = tags)).catch(() => {})
})
</script>

<template>
  <main class="blogs">
    <!-- 左 6/10：博客列表 -->
    <section class="blogs__main">
      <!-- 标题栏：左侧页面标题 + 右侧标签筛选器 -->
      <div class="blogs__headbar">
        <h1 class="blogs__heading">所有博客</h1>
        <ElSelect
          class="blogs__tag-filter"
          multiple
          clearable
          collapse-tags
          placeholder="按标签筛选"
          :model-value="selectedTagIds"
          @update:model-value="onTagFilterChange"
        >
          <ElOption
            v-for="tag in allTags"
            :key="tag.id"
            :value="tag.id"
            :label="tag.name"
          >
            <span class="tag-option">
              <span class="tag-option-dot" :style="{ background: tag.color }" />
              {{ tag.name }}
            </span>
          </ElOption>
        </ElSelect>
      </div>

      <!-- 列表业务组件：自取数，内部维护 loading / loadMore -->
      <BlogList class="blogs__list" :tag-ids="selectedTagIds" />
    </section>

    <!-- 右 4/10：热门文章 + 专题列表（Item 模板由本页通过 renderItem 插槽提供） -->
    <aside class="blogs__side">
      <SideList title="热门文章" :load-data="loadHotData" :paginated="false">
        <template #renderItem="{ topic, index }" class="testststs">
          <div class="hot-item">
            <span class="hot-item__rank" :class="{ 'hot-item__rank--top': index < 3 }">{{ index + 1 }}</span>
            <span class="hot-item__content">
              <span class="hot-item__title"><span class="link-text">{{ topic.title }}</span></span>
              <span class="hot-item__views">
                <ElIcon :size="12">
                  <View />
                </ElIcon>
                {{ topic.view_times }}
              </span>
            </span>
          </div>
        </template>
      </SideList>
      <SideList title="专题列表" :load-data="loadTopicData">
        <template #renderItem="{ topic }">
          <span class="topic-item__title"><span class="link-text">{{ topic.title }}</span></span>
          <time class="topic-item__date">{{ formatDate(topic.update_date) }}</time>
        </template>
      </SideList>
    </aside>
  </main>
</template>

<style lang="scss" scoped>
.blogs {
  // 左 6/10 列表 + 右 4/10 侧栏，占满整个屏幕宽度
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 24px;
  width: 100%;
  padding: 24px;
  // 撑满 header 以下的剩余高度，让侧栏上下两半有空间感
  min-height: calc(100vh - 64px);

  &__main {
    min-width: 0; // 防止长文本把格子撑破
    display: flex;
    flex-direction: column;
  }

  &__headbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__heading {
    margin: 0;
    font-size: 24px;
    color: var(--color-heading);
  }

  &__tag-filter {
    width: 260px;
  }
  &__list {
    flex: 1;
  }

  // 右侧栏：固定不随左侧列表滚动，上下均分
  &__side {
    position: sticky;
    // 吸附位置 = 固定头部 64px + 页面内边距 24px
    top: 88px;
    // 不随网格行高拉伸，高度由自身决定
    align-self: start;
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 24px;
    // 高度 = 视口 - 头部 64px - 上下内边距 48px，让两半恰好充满首屏
    height: calc(100vh - 112px);
    
    .hot-item {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;

      // 排名徽章：18px 小方块，前三名用主题色高亮
      &__rank {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        font-size: 12px;
        background: var(--color-background-mute);
        color: var(--color-text-soft);

        &--top {
          background: var(--color-accent);
          color: #fff;
        }
      }

      // 标题 + 阅读量
      &__content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      &__title {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &__views {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--color-text-soft);
      }
    }
  }
}

// 筛选器下拉选项：色点 + 名称
.tag-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

// ===== SideList 的 renderItem 插槽内容（本页提供模板，样式也在本页作用域） =====

// 下划线只作用于标题文字本身（内联 span 宽度 = 文字宽度），不铺满整个 Item
.link-text {
  text-decoration: underline;
  text-underline-offset: 3px;
}

// 专题 Item：时间在左，标题右对齐与箭头紧邻
.topic-item {
  &__date {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--color-text-soft);
  }

  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

</style>
