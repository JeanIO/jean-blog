<script lang="ts">
/** 时间轴条目，供父组件传入数据 */
export interface TimelineItem {
  /** 时间，如 2024-06 */
  date: string
  /** 事件标题 */
  title: string
  /** 事件描述（可选） */
  desc?: string
}
</script>

<script setup lang="ts">
// TimelineItem 类型来自同文件的普通 script 块，可直接使用
withDefaults(defineProps<{
  items?: TimelineItem[]
}>(), {
  items: () => [],
})
</script>

<template>
  <ul class="timeline">
    <li v-for="(item, index) in items" :key="index" class="timeline__item">
      <span class="timeline__dot" aria-hidden="true" />
      <div class="timeline__content">
        <time class="timeline__date">{{ item.date }}</time>
        <h3 class="timeline__title">{{ item.title }}</h3>
        <p v-if="item.desc" class="timeline__desc">{{ item.desc }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.timeline {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 竖直主线 */
.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 7px;
  width: 2px;
  background-color: var(--color-border);
  border-radius: 1px;
}

.timeline__item {
  position: relative;
  padding: 0 0 28px 32px;
}

.timeline__item:last-child {
  padding-bottom: 0;
}

/* 节点圆点，中心对齐主线 */
.timeline__dot {
  position: absolute;
  top: 5px;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-background);
  border: 2px solid var(--color-accent);
  box-sizing: border-box;
  transition: var(--transition-base); /* 统一使用全局过渡曲线 */
}

/* 悬停互动：圆点放大（悬停整行或直接悬停圆点都触发） */
.timeline__item:hover .timeline__dot {
  transform: scale(1.4);
  background-color: var(--color-accent);
}

.timeline__date {
  display: block;
  font-size: 13px;
  color: var(--color-text-soft);
  margin-bottom: 2px;
}

.timeline__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 4px;
  transition: var(--transition-base); /* 统一使用全局过渡曲线 */
}

/* 悬停时标题跟随圆点一起高亮 */
.timeline__item:hover .timeline__title {
  color: var(--color-accent);
}

.timeline__desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
}
</style>
