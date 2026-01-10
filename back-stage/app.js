import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaStatic from 'koa-static';
import path from 'path';
import getConfig from './config/index.js';
import mainRouter from './routes/index.js';


const config = getConfig();

// 实例化Koa
const app = new Koa();

// 配置中间件
app.use(bodyParser());
app.use(koaStatic(path.join(import.meta.dirname, 'public')));

// 注册全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.body = {
      code: error.status || 500,
      message: error.message || 'Internal Server Error',
      error: error.stack
    };
  }
});

// 使用路由
// app.use(mainRouter.routes()).use(mainRouter.allowedMethods());\
app.use(mainRouter.routes())

// 启动服务器
app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
  console.log(`API documentation: http://localhost:${config.server.port}/api/docs`);
});

export default app;