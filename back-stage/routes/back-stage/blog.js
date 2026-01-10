import Router from '@koa/router';
import { validateBlogId, validateUpdateBlog } from '../../middleware/blog-validator.js';
import * as blogController from '../../controllers/blogManage.js';
import { getBlogById, updateBlog } from "../../controllers/blogManage.js";
import response from '../../utils/response.js';
// 实例化用户路由
const blogRouter = new Router();
// 获取指定ID博客
blogRouter.get('/:blogId', validateBlogId, getBlogById)
// 更新指定ID博客 
blogRouter.patch('/:blogId', validateBlogId, validateUpdateBlog, updateBlog)
// 更新
// blogRouter.patch('/:blogId', async (ctx, next) => {
//   const { blogId } = ctx.params;
//   if (!blogId) {
//     response.badRequest(ctx, 'blogId is required');
//     return;
//   }
//   try {
//     const { title = "无标题博客", content = '', is_published = false, parent_id = null } = ctx.request.body;
//     const result = await blogController.updateBlog({ id, title, content, is_published, parent_id });
//     console.log("update blog id:", result[0]);
//     await next();
//     response.success(ctx, { id, title, content, is_published, parent_id, folder_id: result[0].folder_id, created_date: result[0].create_date, update_date: result[0].update_date });
//   } catch (e) {
//     response.internalError(ctx, 'Failed to update blog', e);
//     return;
//   }
// })





export default blogRouter;