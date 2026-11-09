import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import App from './App.vue'
import router from './router'

// ElLoading：注册 v-loading 全局指令（BlogList 初始加载遮罩用）
createApp(App).use(router).use(ElLoading).mount('#app')
