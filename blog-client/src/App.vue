<script setup lang="ts">
// 顶部导航配置：新增页面时在这里加一项即可
const navItems = [
  { path: '/', label: '首页' },
  { path: '/blogs', label: '博客' },
  { path: '/about-me', label: '关于我' },
]
</script>

<template>
  <!-- 固定顶部导航栏 -->
  <header class="navigator-header">
    <div class="navigator-header__inner">
      <router-link class="navigator-header__brand" to="/">Jean's Blog</router-link>
      <nav class="navigator-header__nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="navigator-header__link"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>

  <main class="app-main">
    <router-view />
  </main>

  <footer class="app-footer">
    <p>© 2026 Jean's Blog · 记录与分享</p>
  </footer>
</template>

<style scoped>
.navigator-header {
  /* 固定头部：悬浮在视口顶部，不随页面滚动 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

@media (prefers-color-scheme: dark) {
  .navigator-header {
    background: rgba(24, 24, 24, 0.85);
  }
}

.navigator-header__inner {
  max-width: 1080px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navigator-header__brand {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-heading);
  text-decoration: none;
}

.navigator-header__nav {
  display: flex;
  gap: 8px;
}

.navigator-header__link {
  padding: 6px 12px;
  border-radius: 6px;
  color: var(--color-text);
  text-decoration: none;
  transition: var(--transition-base); /* 统一使用全局过渡曲线 */
}

.navigator-header__link:hover {
  color: var(--color-accent);
  background-color: var(--color-accent-soft);
}

/* 当前路由高亮 */
.navigator-header__link.router-link-active {
  color: var(--color-accent);
  font-weight: 500;
}

.app-main {
  /* 给固定头部留出占位，避免内容被遮挡 */
  padding-top: 64px;
  min-height: 100vh;
}

.app-footer {
  padding: 32px 24px;
  text-align: center;
  color: var(--color-text-soft);
  font-size: 14px;
  border-top: 1px solid var(--color-border);
}
</style>
