<script setup lang="ts">
</script>

<template>
  <main class="home">
    <section class="home__hero">
      <h1>Jean's Blog</h1>
      <p>记录学习、代码与生活的博客</p>
    </section>
    <!-- 文章列表区域，后续在此扩展 -->
  </main>
</template>

<style scoped>
.home {
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 80px;
}

.home__hero {
  text-align: center;
  padding: 80px 0;
}

.home__hero h1 {
  font-size: 40px;
  margin-bottom: 12px;
  color: var(--color-heading);
}

.home__hero p {
  color: var(--color-text-soft);
  font-size: 16px;
}
</style>
