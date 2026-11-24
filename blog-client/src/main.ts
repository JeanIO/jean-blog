import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import App from './App.vue'
import router from './router'
// 注意：从 lib 子路径按需引入，不要从 '@ice/stark-app' 主入口引——
// 主入口会连带 AppLink 等 React 组件，Vite 打包时 external 成 require('react')，Vue 应用里直接报错
import isInIcestarkModule from '@ice/stark-app/lib/isInIcestark'
import getMountNodeModule from '@ice/stark-app/lib/getMountNode'

// CJS 互操作：模块 default 是 exports 对象（{ default: fn }），真正的函数挂在 .default 上
const isInIcestark = ((isInIcestarkModule as any).default ?? isInIcestarkModule) as () => boolean
const getMountNode = ((getMountNodeModule as any).default ?? getMountNodeModule) as (element?: string | Element) => Element

let app: ReturnType<typeof createApp> | null = null

// ElLoading：注册 v-loading 全局指令（BlogList 初始加载遮罩用）
function render(container: string | Element): void {
  app = createApp(App).use(router).use(ElLoading)
  app.mount(container)
}

// icestark 微应用生命周期：容器由主应用提供
export function mount(): void {
  render(getMountNode())
}

export function unmount(): void {
  app?.unmount()
  app = null
}

// 独立运行时（非微前端环境）直接挂载到自身 html 的 #app
if (!isInIcestark()) {
  render('#app')
}
