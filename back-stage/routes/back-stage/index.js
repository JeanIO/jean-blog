
import Router from '@koa/router';
import userRouter from './user.js';
import serviceRouter from '../service/service.js';
import folderRouter from './folder.js';
import blogRouter from './blog.js';

// 实例化主路由
const backStageRouter = new Router();

// 注册子路由

// clientRouter.use(homeRouter.routes(), homeRouter.allowedMethods());
// mainRouter.use('/api/users', userRouter.routes(), userRouter.allowedMethods());
backStageRouter.use('/blogs', blogRouter.routes(), blogRouter.allowedMethods());
backStageRouter.use('/folders', folderRouter.routes(), folderRouter.allowedMethods());

export default backStageRouter; 
