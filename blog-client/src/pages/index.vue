<script setup lang="ts">
import { onMounted, ref } from 'vue'

const textRef = ref<SVGTextElement | null>(null)
/** 描边总长度：先给个初始值，挂载后按实际文字宽度估算 */
const dashLength = ref(5000)
/** 是否开始绘制动画 */
const drawn = ref(false)

onMounted(() => {
  const el = textRef.value
  if (el) {
    // 字形轮廓长度远大于排版宽度，乘一个安全系数保证整条轮廓都被 dash 覆盖
    dashLength.value = Math.max(el.getComputedTextLength() * 6.5, 3000)
  }
  // // 等 dash 长度写入后再触发绘制过渡，避免闪烁
  requestAnimationFrame(() => {
    drawn.value = true
  })
})
</script>

<template>
  <main class="home">
    <section class="home__hero">
      <h1 class="sr-only">Jean's Blog</h1>

      <!-- 艺术字：进入页面时笔画一笔一笔写出来，写完渐入渐变填充 -->
      <svg
        class="brand-svg"
        viewBox="0 0 640 160"
        role="img"
        aria-label="Jean's Blog"
      >
        <defs>
          <linearGradient id="brand-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="hsla(160, 100%, 37%, 1)" />
            <stop offset="100%" stop-color="#1890ff" />
          </linearGradient>
        </defs>
        <text
          ref="textRef"
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="central"
          class="brand-text"
          :class="{ 'brand-text--drawn': drawn }"
          :style="{
            strokeDasharray: `${dashLength}, ${dashLength}`,
            strokeDashoffset: drawn ? 0 : dashLength,
          }"
        >
          Jean's Blog
        </text>
      </svg>

      <p class="home__slogan" :class="{ 'home__slogan--show': drawn }">
        记录学习、代码与生活的博客
      </p>
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

/* 屏幕阅读器可见、视觉隐藏的标题 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.brand-svg {
  display: block;
  /* 固定宽度：不随窗口大小缩放 */
  width: 560px;
  height: auto;
  margin: 0 auto 12px;
  overflow: visible;
}

.brand-text {
  font-family:
    'Snell Roundhand', 'Apple Chancery', 'Segoe Script', 'Brush Script MT', cursive;
  font-size: 76px;
  letter-spacing: 2px;
  /* 初始只显示描边，fill 透明；写完后再渐入渐变填充 */
  fill: url(#brand-fill);
  fill-opacity: 0;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  transition:
    stroke-dashoffset 4s linear,
    fill-opacity 0.8s ease-in 3.7s;
}

/* 绘制完成后填充渐入 */
.brand-text--drawn {
  fill-opacity: 1;
}

.home__slogan {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 16px;
  opacity: 0;
  transform: translateY(6px);
  /* 与艺术字填充渐入（0.8s ease-in 3.7s）对齐：同时开始、同时完成 */
  transition: opacity 0.8s ease-in 3.7s, transform 0.8s ease-in 3.7s;
}

.home__slogan--show {
  opacity: 1;
  transform: none;
}

/* 尊重系统"减少动态效果"设置：跳过动画直接显示 */
@media (prefers-reduced-motion: reduce) {
  .brand-text,
  .home__slogan {
    transition: none;
  }
}
</style>
