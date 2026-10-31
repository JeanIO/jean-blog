<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="section-title">
    <h2 class="section-title__heading">
      <!-- 图标插槽：由使用方传入对应的小图标 -->
      <span class="section-title__icon">
        <slot name="icon" />
      </span>
      {{ title }}
    </h2>
    <!-- 分割线：占满剩余宽度 -->
    <span class="section-title__line" aria-hidden="true" />
  </div>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  font-size: 18px;
  color: var(--color-heading);
}

.section-title__icon {
  display: inline-flex;
  align-items: center;
  color: var(--color-accent);
  transition: var(--transition-base); /* 统一使用全局过渡曲线 */
}

.section-title__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.section-title__line {
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}
</style>
