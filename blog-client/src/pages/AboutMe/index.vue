<script setup lang="ts">
import TimeLine, { type TimelineItem } from '@/components/TimeLine.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconTooling from '@/components/icons/IconTooling.vue'
import IconClock from '@/components/icons/IconClock.vue'

const skills = ['React', 'Vue 3', 'TypeScript', 'RxJS', 'Next.js', 'Webpack', 'Node.js', 'RTC / MQTT']

// 人生经历：从简历中提炼的关键节点
const timelineItems: TimelineItem[] = [
  {
    date: '2013.09 - 2017.07',
    title: '黑龙江大学 · 软件工程',
    desc: '系统学习计算机基础：数据结构、计算机网络、操作系统、汇编语言等，打下扎实的编程功底。',
  },
  {
    date: '2018.05 - 2021.05',
    title: '杭州雅顾科技 · 前端开发工程师',
    desc: '参与企业在线培训平台「目睹有课」开发，负责直播互动、全平台国际化、视频分片上传、流监控与权限管理等模块。',
  },
  {
    date: '2021.06 - 2021.09',
    title: '杭州涂鸦技术 · 高级研发工程师',
    desc: '主导自研 IM 客服聊天 SDK，独立完成 MQTT 底层协议集成与联调，替代腾讯通信服务、降低公司成本。',
  },
  {
    date: '2021.09 - 2023.06',
    title: '阿里巴巴（杭州）· 前端负责人',
    desc: '主导 RTC 推拉流 SDK 底层重构：RxJS 责任链整合异步调用链、API Promise 化、traceId 全链路日志；并带领团队从 0 到 1 交付 AI 红娘及党建业务系统。',
  },
]
</script>

<template>
  <main class="about-me">
    <header class="about-me__header">
      <h1>关于我</h1>
      <p class="about-me__slogan">保持好奇，持续学习，把想法变成代码。</p>
    </header>

    <div class="about-me__grid">
      <!-- 左列：个人简介 -->
      <section class="about-me__intro">
        <SectionTitle title="个人简介">
          <template #icon><IconUser /></template>
        </SectionTitle>
        <p>
          你好，我是 Jean，一名有 6 年经验的全栈工程师（偏前端）。
          精通 React 技术栈，熟练使用 Vue，主导过 RTC SDK 重构、
          IM SDK 研发等复杂项目，具备整体 toB 产品的架构思维。
          这个博客用来记录我在编程路上的学习与思考。
        </p>

        <SectionTitle title="技能栈">
          <template #icon><IconTooling /></template>
        </SectionTitle>
        <ul class="about-me__skills">
          <li v-for="skill in skills" :key="skill" class="about-me__skill-tag">
            {{ skill }}
          </li>
        </ul>
      </section>

      <!-- 右列：时间轴 -->
      <aside class="about-me__timeline">
        <SectionTitle title="时间轴">
          <template #icon><IconClock /></template>
        </SectionTitle>
        <TimeLine :items="timelineItems" />
      </aside>
    </div>
  </main>
</template>

<style scoped>
.about-me {
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 80px;
}

.about-me__header {
  margin-bottom: 48px;
}

.about-me__header h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: var(--color-heading);
}

.about-me__slogan {
  color: var(--color-text-soft);
}

/* 左简介 + 右时间轴两列布局 */
.about-me__grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 64px;
  align-items: start;
}

.about-me__intro p {
  line-height: 1.9;
  color: var(--color-text);
  margin-bottom: 32px;
}

.about-me__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.about-me__skill-tag {
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 999px;
  color: var(--color-accent);
  background-color: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border, transparent);
}

/* 窄屏时时间轴折到简介下方 */
@media (max-width: 768px) {
  .about-me__grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
