
import Router from '@koa/router';
// 实例化主路由
const clientRouter = new Router();

// 注册子路由

// clientRouter.use(homeRouter.routes(), homeRouter.allowedMethods());
// mainRouter.use('/api/users', userRouter.routes(), userRouter.allowedMethods());
// clientRouter.use('/client/blogs', blogRouter.routes(), blogRouter.allowedMethods());
export default clientRouter; 
