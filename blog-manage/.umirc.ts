import { defineConfig } from "umi";
import routes from "./src/pages/routes"
export default defineConfig({
  routes: [
    // { path: "/", component: "DefaultPage" }
    ...routes
  ],
  // icestark 微应用：路由挂在 /manage 下，渲染进主应用提供的 #icestarkNode 容器
  base: '/manage',
  mountElementId: 'icestarkNode',
  // dev 下 webpack 异步 chunk 默认按相对路径解析，在壳内会解析成主应用的 origin 导致 404，
  // 必须用绝对地址指向自己的 dev server
  publicPath: 'http://localhost:8001/',
  // MFSU 会用自己的 publicPath 构建依赖 chunk，在壳内同样会 404，dev 下关掉
  mfsu: false,
  plugins:["./plugins/htmlConvert"],
  npmClient: 'npm',
  externals: {
    'react': 'window.React',
    'react-dom': 'window.ReactDOM',
  },
  hash: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000/',
      changeOrigin: true,
    },
  },
  writeToDisk: true,
  favicons: ["https://avatars.githubusercontent.com/u/23093076?v=4"],

});

