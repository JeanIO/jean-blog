
import Router from '@koa/router';
import clientRouter from './client/index.js';
import serviceRouter from './service/index.js';
import backStageRouter from './back-stage/index.js';
import sqlPool from '../models/sql.js';
import response from '../utils/response.js';

// 实例化主路由
const mainRouter = new Router();

// 数据库连接检查中间件
const dbConnectionMiddleware = async (ctx, next) => {
    // 获取当前连接状态
    const status = sqlPool.getStatus();
    
    // 如果未连接或连接错误，尝试初始化连接
    if (status !== 'connected') {
      console.log('Database not connected, attempting to connect...');
      
      try {
        // 使用Promise包装init方法，确保连接完成后再继续
        await new Promise((resolve, reject) => {
          try {
            sqlPool.init();
            // 定期检查连接状态
            const checkInterval = setInterval(() => {
              const currentStatus = sqlPool.getStatus();
              if (currentStatus === 'connected') {
                clearInterval(checkInterval);
                resolve();
              } else if (currentStatus === 'error') {
                clearInterval(checkInterval);
                reject(new Error('Database connection error'));
              }
            }, 100);
            
            // 设置连接超时
            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error('Database connection timeout'));
            }, 5000);
          } catch (error) {
            reject(error);
          }
        });
        await next(); // 使用await确保异步处理正确
      } catch (error) {
        console.error('Database connection error in middleware:', error);
        // 返回500状态码和数据库连接异常提示
        response.internalError(ctx, null, '数据库连接异常，请稍后重试');
      }
    } else {
      await next(); // 使用await确保异步处理正确
    }
}

// 注册子路由

// 为/back-stage路由添加数据库连接检查中间件
mainRouter.use('/api/back-stage', dbConnectionMiddleware, backStageRouter.routes(), backStageRouter.allowedMethods());
mainRouter.use('/api/services', serviceRouter.routes(), serviceRouter.allowedMethods());
mainRouter.use('/api/client', clientRouter.routes(), clientRouter.allowedMethods());
export default mainRouter;