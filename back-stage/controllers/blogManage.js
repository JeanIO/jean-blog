
import { model_insertBlog,
  model_getBlogsFilter,
  model_deleteBlog,
  model_getBlogByIDFilter,
  model_updateBlog,
  model_getBlogByIds,
  model_getPathBlogs,
  model_getParentBlog,
} from "../models/blogManage.js";
import { extractNumbersFromSlash } from "../utils/str.js";
import response from '../utils/response.js';

// childOne { title, content, is_published, parent_id = null, path }
// parentBlog undefined | { id, folder_id, path }
async function validateBlogWithParent(childBlog, parentBlog) {
  // 1. 校验子博客与父博客的发布状态是否一致
  // 2. 不允许移动到已删除的博客下边
  // 3. 校验子博客和父博客是否在同一文件夹下
  if (parentBlog === undefined) {
    if (childBlog.parent_id !== null) {
      parentBlog = await model_getBlogByIds(childBlog.parent_id);
    } else {
      parentBlog = null
    }
  }
  if (parentBlog !== null) {
    if (parentBlog.is_published !== childBlog.is_published && parentBlog.is_published === 0) {
      throw new Error('父博客未发布的前提下，子博客无法发布');
    }
  }
}

function formatBlogTree(root, children) {
  root.children = [];
  let map = new Map()
  debugger
  children.forEach((item) => {
    item.children = [];
    map.set(item.id, item);
  })
  map.set(root.id, root);
  for (let i = 0; i < children.length; i++) {
    if(!map.get(children[i].parent_id)) {
      console.log("这个id的父节点找不到", children[i].id)
    }
    map.get(children[i].parent_id).children.push(children[i]);
  }
  return root;
}

function getUpdatePaths(currentPath, root, updateData, needUnpublish) {
  root.forEach((item) => {
    let updateItem = {}
    updateItem.id = item.id
    updateItem.path = currentPath
    needUnpublish && (updateItem.is_published = 0)
    updateData.push(updateItem);
    if (item.children.length > 0) {
      getUpdatePaths(`${currentPath}/${item.id}`, item.children, updateData, needUnpublish);
    }
  })
  return updateData;
}

// 创建博客 校验parent_id和folder_id
async function createBlog(ctx, next) {
  const { folderId } = ctx.params
  const { title, content, is_published = 0, parent_id = null } = ctx.request.body;
  let path = '/'
  if (parent_id !== null) { // 校验parent_id和folder_id是否匹配
    const [parentBlog] = await model_getBlogByIds(parent_id);
    if (!parentBlog) {
      response.badRequest(ctx, '不存在parent_id的博客');
      return;
    }

    if (parentBlog.folder_id !== folderId) {
      response.badRequest(ctx, "新建文件必须同属父文件所在文件夹下");
      return;
    }
    if (parentBlog.is_published !== is_published && parentBlog.is_published === 0) {
      response.badRequest(ctx, '父博客未发布的前提下，无法直接创建发布状态的子博客');
      return;
    }
    let parentIds = extractNumbersFromSlash(parentBlog.path)
    path = parent_id !== null ? `/${parentIds.length === 0 ? '' : parentIds.join('/') + '/'}${parent_id}` : `/`;
  }

  try {
    const value = await model_insertBlog({ title, content, is_published, folder_id: folderId, parent_id, path });
    response.success(ctx, value);
    await next();
  } catch (e) {
    response.internalError(ctx, 'Failed to create blog', e);
    return;
  }
}

// 删除指定文件或文件夹下所有博客
async function deleteBlogById(body) {
  const { blogId } = body
  try {
    const value = await model_deleteBlog(blogId);
    console.log("删除成功", value)
    return value
  } catch (e) {
    throw e;
  }
}


// 使用parentId获取子博客
async function getBlogByParentId(body) {
  const { blogId } = body
  try {
    const blogs = await model_getBlogByIDFilter({ parentId: blogId });
    return blogs;
  } catch (e) {
    throw e;
  }
}

// todo 模糊查询
async function getBlogsFilter(body) {
  const { title, content } = body;
  try {
    const blogs = await model_getBlogsFilter({ title, content });
    return blogs;
  } catch (e) {
    throw e;
  }
}


async function updateBlog(ctx, next) {
  const { blogId } = ctx.params;
  const { action } = ctx.request.body;
  try {
    if (action === "CONTENT") { // 仅更新内容
      const { body: { title = "无标题博客", content = '' } } = ctx.request.body;
      await model_updateBlog({ id: blogId, title, content, update_date: new Date() });
      const [result] = await model_getBlogByIds(blogId)
      response.success(ctx, result);
      await next();
    } else if (action === "MOVE") { // 移动博客的逻辑块
      const { body: { folder_id, parent_id = null } } = ctx.request.body;
      let path = '/'
      let needUnpublish = false, parentBlog, currentBlog
      if (parent_id !== null) { // 移动的parent_id不为null得校验 如果是null那随便
        let blogs = await model_getBlogByIds([parent_id, blogId]);
        blogs.forEach(item => {
          if(item.id === parent_id) parentBlog = item
          if(item.id === blogId) currentBlog = item
        })
        if (!parentBlog) {
          response.badRequest(ctx, '不存在parent_id的博客');
          return;
        }
        if (!currentBlog) {
          response.badRequest(ctx, '不存在该博客，无法移动');
          return;
        }
        // 校验子博客与父博客是否同处在一个文件夹下
        if (folder_id !== parentBlog.folder_id) {
          response.badRequest(ctx, "更新文件必须同属父文件所在文件夹下");
          return;
        }
        if (currentBlog.is_published !== parentBlog.is_published && parentBlog.is_published === 0) {
          // 如果父博客和子博客发布状态不同并且父博客还没发布 那所有的子博客都需要更改为未发布
          needUnpublish = true
        }
        let parentIds = extractNumbersFromSlash(parentBlog.path)
        path = parent_id !== null ? `/${parentIds.length === 0 ? '' : (parentIds.join('/') + '/')}${parent_id}` : `/`;
      } else {
        // 移动到根目录不需要更新博客的发布状态
        path = `/`;
        [currentBlog] = await model_getBlogByIds([blogId]);
        if (!currentBlog) {
          response.badRequest(ctx, '不存在该博客，无法移动');
          return;
        }
        needUnpublish = false
      }
      const children = await model_getPathBlogs({ blogId });
      const root = formatBlogTree(currentBlog, children || []);
      
      const updateData = getUpdatePaths(path, [root], [], needUnpublish);
      console.log("updateData:", updateData)
      let date = new Date()
      updateData.forEach((item) => {
        if(item.id === blogId) {
          item.parent_id = parent_id;
        }
        item.update_date = date;
      })
      await model_updateBlog(updateData);
      response.success(ctx, updateData);
      await next();
    
    } else {  // action === "PUBLISH" 发布博客

      const { body: { publish_status = 0 } } = ctx.request.body;
      if (publish_status === 0) { // 下架发布要校验子博客是否都已下架
        const children = await model_getPathBlogs({ blogId });
        const publishedChildren = children.filter(item => item.is_published === 1);
        if (publishedChildren.length > 0) {
          response.badRequest(ctx, "下架发布必须先下架所有子博客");
          return;
        }
      } else {
        const [parentBlog] = await model_getParentBlog([blogId]);
        if (parentBlog !== null && parentBlog.is_published !== 1) {
          response.badRequest(ctx, "发布博客必须先发布所有父博客");
          return;
        }
      }
      let now = new Date()
      await model_updateBlog({ id: blogId, is_published: publish_status, update_date: now });
      response.success(ctx, { id: blogId, publish_status, update_date: now });
    }
  } catch (e) {
    response.internalError(ctx, 'Failed to update blog', e);
    return;
  }
}

// TODO 以下这个是批量发布的部分逻辑 留着后面复用
// const { body: { publish_group = [], publish_status = 0 } } = ctx.request.body;
// try {
//   const [currentBlog] = await model_getBlogByIds(id);
//   if(publish_status === 0) {
//     // 查询所有儿子并验证

//   } else {
//     // 校验所有父亲是否合规
//     const parent_blogs = await model_getParentBlog(publish_group);
//     const canPublish = parent_blogs.filter(item => {
//       if(item === null) return false
//       if(item.is_published === 1) return false // 如果说父结点发布了，那我就不用再去发布了
//       return publish_group.includes(item.id) // 如果说父结点在发布组里，那我就可以发布
//     })
//   }
//   publish_group.push(id)
//   const [result] = await model_getBlogByIds(id)
//   const { path } = result
//   const parents = path.split('/').filter((item) => item !== '');
//   model_updateBlogs(parents.map((item) => ({ id: item, is_published })));
//   response.success(ctx, result);
//   await next();
// } catch(e) {
//   throw e;
// }

// try {
//   if(parent_id !== null) { // 校验parent_id和folder_id是否匹配
//     const parentBlog = await model_getBlogByIds(parent_id);
//     if(!parentBlog){
//       response.badRequest(ctx, '不存在parent_id的博客');
//       return;
//     }
//     if(parentBlog.folder_id !== folderId){
//       response.badRequest(ctx, "更新文件必须同属父文件所在文件夹下");
//       return;
//     }
//   }
//   await model_updateBlog({ id: blogId, title, content, is_published, parent_id, update_date: new Date() });
//   const resule = await model_getBlogByIds(blogId)
//   return resule[0]
// }catch(e) {
//   throw e;
// }

// 获取详细内容方法
async function getBlogById(ctx, next) {
  const { blogId } = ctx.params
  try {
    const [blog] = await model_getBlogByIds(blogId);
    response.success(ctx, blog)
    await next()
  } catch (e) {
    response.internalError(ctx, 'Failed to get blog', e);
    return;
  }
}
// 获取文件夹下所有博客
async function getBlogsByFolderId(ctx, next) {
  const { folderId } = ctx.params;
  try {
    const blogs = await model_getBlogByIDFilter({ folderId });
    response.success(ctx, { list: blogs ?? [] });
    await next();
  } catch (e) {
    response.internalError(ctx, 'Failed to get blogs by folder id', e);
    return;
  }
}

export {
  createBlog,
  deleteBlogById,
  getBlogById,
  getBlogsByFolderId,
  getBlogByParentId,
  updateBlog,
}
