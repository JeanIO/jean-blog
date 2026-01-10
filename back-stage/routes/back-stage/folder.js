
import { createFolder, deleteFolder, updateFolder, getFolderList, getFolderById } from '../../controllers/folder.js';
import { getBlogsByFolderId, createBlog, updateBlog } from '../../controllers/blogManage.js';
import { validateInsertFolder, validateFolderId } from "../../middleware/folder-validate.js"
import { validateCreateBlog, validateBlogId } from "../../middleware/blog-validator.js"
import response from '../../utils/response.js';
import Router from '@koa/router';

const folderRouter = new Router();
// 创建文件夹
folderRouter.post('/', validateInsertFolder, createFolder);
// 获取所有文件夹
folderRouter.get('/', getFolderList);
// 获取指定ID文件夹信息
folderRouter.get('/:folderId', validateFolderId, getFolderById);
// 更新指定ID文件夹信息
folderRouter.patch('/:folderId', validateFolderId, validateInsertFolder,updateFolder);
// 删除指定ID文件夹
folderRouter.delete('/:folderId', validateFolderId, deleteFolder )
// 获取文件夹下的所有博客
folderRouter.get('/:folderId/blogs', validateFolderId, getBlogsByFolderId)
// 在相应文件夹的相应博客下创建博客 /:id/blogs是根目录
folderRouter.post('/:folderId/blogs', validateFolderId, validateCreateBlog, createBlog)

// 删除文件夹下的指定博客及所有子博客
// folderRouter.delete('/:id/blogs/:blogId', validateFolderId, validateBlogId, async (ctx, next) => {
//   const { id, blogId } = ctx.params;
//   if(!id || !blogId) {
//     response.badRequest(ctx, 'folder id or blog id is required');
//     return;
//   }
//   try {
//     await deleteBlog({ id: blogId, folder_id: id });
//     await next();
//     response.success(ctx);
//   } catch (e) {
//     response.internalError(ctx, 'Failed to delete blog', e);
//     return;
//   }
// });


export default folderRouter;


