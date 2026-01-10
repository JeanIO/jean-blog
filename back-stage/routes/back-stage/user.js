import Router from '@koa/router';
import * as userController from '../../controllers/user.js';

// 实例化用户路由
const userRouter = new Router();

// 定义用户路由
userRouter.get('/', userController.getUsers);
userRouter.get('/:id', userController.getUserById);
userRouter.post('/', userController.createUser);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);

export default userRouter;