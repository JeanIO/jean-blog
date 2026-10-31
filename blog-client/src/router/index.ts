import { createRouter, createWebHistory } from 'vue-router'

// 路由 path 统一使用 - 分割单词（kebab-case），例如 /about-me
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue'),
    },
    {
      path: '/about-me',
      name: 'about-me',
      component: () => import('@/pages/AboutMe/index.vue'),
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: () => import('@/pages/Blogs/index.vue'),
    },
    {
      // 未匹配到的路由统一回首页
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
