import { defineAppConfig } from 'ice';
import { defineFrameworkConfig } from '@ice/plugin-icestark/types';
import FrameworkLayout from './layouts/FrameworkLayout';
import PageLoading from './components/PageLoading';

export const icestark = defineFrameworkConfig(() => ({
  layout: FrameworkLayout,
  getApps: () => ([
    // 注意：AppRouter 按数组顺序取第一个匹配的 AppRoute，
    // 所以 /manage 必须排在根路径 / 之前，否则会被前台应用抢占
    {
      path: '/manage',
      title: '管理后台',
      // Umi(webpack) 产物不是 ESM，用 fetch 模式加载 index.html 里的脚本
      loadScriptMode: 'fetch',
      // 8000 被旧的 umi dev 实例占用，暂用 8001（新配置实例）；旧实例关掉后可改回 8000
      entry: 'http://localhost:8001/index.html',
    },
    {
      path: '/',
      title: '博客前台',
      // Vite 应用输出 ESM，用 import 模式
      loadScriptMode: 'import',
      entry: 'http://localhost:5173/index.html',
    },
  ]),
  appRouter: {
    LoadingComponent: PageLoading,
  },
}));

export default defineAppConfig(() => ({
  app: {
    rootId: 'app',
  },
}));
