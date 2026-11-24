import { defineConfig } from '@ice/app';
import icestark from '@ice/plugin-icestark';
import fusion from '@ice/plugin-fusion';

export default defineConfig(() => ({
  ssg: false,
  // 子应用在壳内运行时请求走壳的 origin，/api 由壳统一代理到后端服务
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  plugins: [
    fusion({
      themePackage: '@alifd/theme-design-pro',
      theme: {
        'css-prefix': 'next-icestark-',
      },
    }),
    icestark({ type: 'framework' }),
  ],
}));
