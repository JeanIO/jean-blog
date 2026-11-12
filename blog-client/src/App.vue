<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElIcon, ElPopover, ElSlider } from 'element-plus'
import { Headset } from '@element-plus/icons-vue'
// 背景视频：import 方式引入，Vite 打包后给出正确的资源 URL（写死字符串路径不会被打包处理）
import bgVideo from './assets/out.mp4'

const route = useRoute()
/** 背景视频只在首页展示；切到其他页面时视频卸载（停止下载/播放，省流量） */
const isHome = computed(() => route.path === '/')

// 顶部导航配置：新增页面时在这里加一项即可
const navItems = [
  { path: '/', label: '首页' },
  { path: '/blogs', label: '博客' },
  { path: '/about-me', label: '关于我' },
]

/** —— 背景视频声音控制 —— */
const videoRef = ref<HTMLVideoElement | null>(null)
/** 默认静音（autoplay 策略要求 muted 才能自动播放），点击按钮切换 */
const muted = ref(true)
/** 音量 0-100 */
const volume = ref(50)


/**
 * 开关声音。关键点：浏览器 autoplay 策略要求"有音频的播放必须由用户手势触发"，
 * 所以这里在 click 处理器内【同步】操作 video 元素——解锁音频不能靠异步 watcher。
 */
const toggleMuted = () => {
  const video = videoRef.value
  if (!video) return
  muted.value = !muted.value

  video.muted = muted.value
  if (!muted.value) {
    video.volume = volume.value / 100
    video.play().catch(() => {}) // 确保处于播放中（用户可能手动暂停过）
  }

}

// 音量滑块变化时同步到 video（音量调整不涉及音频解锁，watcher 即可）
watch(volume, () => {
  const video = videoRef.value
  if (!video) return
  video.volume = volume.value / 100
})
</script>

<template>
  <!-- 固定顶部导航栏：首页降低背景透明度让视频透出来，其他页面保持默认 -->
  <header
    class="navigator-header"
    :class="{ 'navigator-header--transparent': isHome }"
  >
    <div class="navigator-header__inner">
      <router-link class="navigator-header__brand" to="/">Jean's Blog</router-link>
      <div class="navigator-header__right">
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
        <!-- 声音控制：只在首页展示（视频只有首页有） -->
        <ElPopover v-if="isHome" trigger="hover" :width="220" placement="bottom-end">
          <template #reference>
            <button
              class="sound-btn"
              :class="{ 'sound-btn--muted': muted }"
              type="button"
              :title="muted ? '打开声音' : '静音'"
              @click="toggleMuted"
            >
              <span class="headset-wrap" :class="{ 'headset-wrap--muted': muted }">
                <ElIcon :size="18"><Headset /></ElIcon>
              </span>
            </button>
          </template>
          <!-- 音量面板 -->
          <div class="volume-panel">
            <span class="headset-wrap" :class="{ 'headset-wrap--muted': muted }">
              <ElIcon :size="14"><Headset /></ElIcon>
            </span>
            <ElSlider v-model="volume" :max="100" class="volume-panel__slider" />
            <span class="volume-panel__value">{{ volume }}%</span>
          </div>
        </ElPopover>
      </div>
    </div>
    脚本生效了
  </header>

  <main class="app-main">
    <!-- 背景视频：仅首页渲染，铺满整个 main 区域，autoplay 必须 muted 才能被浏览器允许自动播放 -->
    <template v-if="isHome">
      <video
        ref="videoRef"
        class="app-main__video"
        :src="bgVideo"
        autoplay
        :muted="muted"
        loop
        playsinline
      />
      <!-- 半透明遮罩：保证浮在视频上的内容可读；声音打开时降低浓度让画面更鲜艳 -->
      <div
        class="app-main__overlay"
        :class="{ 'app-main__overlay--clear': !muted }"
        aria-hidden="true"
      />
    </template>
    <div class="app-main__content">
      <router-view />
    </div>
  </main>

  <footer class="app-footer">
    <p>© 2026 Jean's Blog · 记录与分享</p>
  </footer>
</template>

<style lang="scss" scoped>
.navigator-header {
  /* 固定头部：悬浮在视口顶部，不随页面滚动 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* 与全局最小宽度一致，窄窗口下跟随内容区一起横向滚动 */
  min-width: 768px;
  z-index: 100;
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.3s ease;

  /* 首页：降低背景透明度，让视频透出来 */
  &--transparent {
    background: rgba(255, 255, 255, 0.3);
  }
}


.navigator-header__inner {
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 右侧区域：导航 + 声音控制 */
.navigator-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 声音按钮：纯图标，无背景无边框；静音态颜色弱化，开声态主题色 */
.sound-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-accent);
  transition: var(--transition-base);

  &--muted {
    color: var(--color-text-soft);
  }
}

/* 耳机图标包装：静音态在图标上叠加一条斜杠（按钮和音量面板共用） */
.headset-wrap {
  position: relative;
  display: inline-flex;
  line-height: 0;

  &--muted::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 140%;
    height: 2px;
    background: var(--color-text-soft);
    border-radius: 1px;
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}

.navigator-header__brand {
  font-size: 18px;
  /* 与首页 hero 同款艺术字体（Snell Roundhand 手写体栈） */
  font-family:
    'Snell Roundhand', 'Apple Chancery', 'Segoe Script', 'Brush Script MT', cursive;
  letter-spacing: 1px;
  color: var(--color-accent);
  /* 手写体没有真粗体，用 0.5px 描边把笔画加粗约 1px */
  -webkit-text-stroke: 0.5px currentColor;
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
  position: relative;
  padding-top: 64px;
  min-height: 100vh;

  /* 背景视频：铺满 main，等比裁剪不拉伸 */
  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  /* 遮罩层：声音打开（用户感兴趣）时降低浓度，画面更鲜艳 */
  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: rgba(255, 255, 255, 0.55);
    transition: background 0.3s ease;

    &--clear {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  /* 页面内容浮在视频上方 */
  &__content {
    position: relative;
    z-index: 2;
  }
}

.app-footer {
  padding: 32px 24px;
  text-align: center;
  color: var(--color-text-soft);
  font-size: 14px;
  border-top: 1px solid var(--color-border);
}
</style>
