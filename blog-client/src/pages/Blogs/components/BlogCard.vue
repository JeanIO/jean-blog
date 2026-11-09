<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import type { Topic } from '@/requests/blog'

defineProps<{
  topic: Topic
}>()
</script>

<template>
  <!-- 新标签页打开详情，列表页本身保持不动 -->
  <RouterLink
    :to="`/blogs/${topic.id}`"
    target="_blank"
    rel="noopener"
    class="blog-card"
  >
    <div class="blog-card__head">
      <h2 class="blog-card__title">{{ topic.title }}</h2>
      <time class="blog-card__date">更新时间: {{ formatDate(topic.update_date) }}</time>
    </div>
    <p class="blog-card__summary">{{ topic.summary || '暂无简介' }}</p>
    <div class="blog-card__meta">
      <!-- 标签：颜色取标签自身配色，背景用同色 10% 透明度 -->
      <div class="blog-card__tags">
        <span
          v-for="tag in topic.tags"
          :key="tag.id"
          class="tag-chip"
          :style="{ color: tag.color, backgroundColor: tag.color + '1a' }"
        >{{ tag.name }}</span>
      </div>
      <div class="blog-card__stats">
        <span class="blog-card__views" title="阅读次数">
          <ElIcon :size="14"><View /></ElIcon>
          {{ topic.view_times }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.blog-card {
  display: block;
  // 纯白卡片 + 细边框
  padding: 20px 24px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    // hover：边框点亮为主题色 + 些许阴影
    border-color: var(--color-accent);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    color: var(--color-heading);
  }

  &__date {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-soft);
  }

  &__summary {
    margin: 0 0 12px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-text);
    // 简介超长时最多展示两行
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
    color: var(--color-text-soft);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  &__views {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

// 标签胶囊
.tag-chip {
  font-size: 12px;
  line-height: 1;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
</style>
