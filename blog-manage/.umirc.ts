import { defineConfig } from "umi";
import routes from "./src/pages/routes"
export default defineConfig({
  routes: [
    // { path: "/", component: "DefaultPage" }
    ...routes
  ],
  plugins:["./plugins/htmlConvert"],
  npmClient: 'npm',
  externals: {
    'react': 'window.React',
    'react-dom': 'window.ReactDOM',
  },
   proxy: {
    '/api': {
      target: 'http://localhost:3000/',
      changeOrigin: true,
    },
  },
  writeToDisk: true,
  favicons: ["https://avatars.githubusercontent.com/u/23093076?v=4"]
});

