<script setup lang="ts">
import SectionTitle from '@/components/SectionTitle.vue'
import IconDocumentation from '@/components/icons/IconDocumentation.vue'
</script>

<template>
  <main class="blogs">
    <SectionTitle title="博客">
      <template #icon><IconDocumentation /></template>
    </SectionTitle>

    <!-- 文章列表区域，后续在此扩展 -->
    <p class="blogs__empty">还没有文章，敬请期待～</p>
  </main>
</template>

<style scoped>
.blogs {
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 80px;
}

.blogs__empty {
  padding: 80px 0;
  text-align: center;
  color: var(--color-text-soft);
}
</style>
