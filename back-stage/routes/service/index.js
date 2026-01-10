
import serviceRouter from './service.js';
import Router from '@koa/router';
// 实例化主路由
const sRouter = new Router();

// 注册子路由


// mainRouter.use('/api/users', userRouter.routes(), userRouter.allowedMethods());
sRouter.use(serviceRouter.routes(), serviceRouter.allowedMethods());
export default sRouter;
