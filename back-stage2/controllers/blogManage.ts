import type { Context, Next } from "koa"
import {
  model_insertBlog,
  model_getBlogsFilter,
  model_deleteBlog,
  model_getBlogByIDFilter,
  model_updateBlog,
  model_getBlogByIds,
  model_getPathBlogs,
  model_getParentBlog,
  model_getSortIndexByPrevId,
} from "../models/blogManage.js"
import { extractNumbersFromSlash, extractBlockquote } from "../utils/str.js"
import response from "../utils/response.js"
import type { SQLBlog } from "../types/models.js"
import type { CreateBlogInput, UpdateBlogInput, BatchUpdateBlogItem } from "./types/blog"
import * as tagModel from "../models/tag.js"

interface BlogTree extends SQLBlog {
  children: BlogTree[]
}

/**
 * 校验 tag_ids 并去重：必须是正整数数组，且每个 id 都要在 blog_tag 里真实存在。
 * 创建/修改博客时共用，避免把不存在的标签 id 塞进关联表触发外键错误。
 */
async function normalizeTagIds(raw: any): Promise<{ valid: boolean; message?: string; ids: number[] }> {
  const ids: number[] = Array.from(new Set<number>(raw))
  if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
    return { valid: false, message: "tag_ids 必须是正整数数组", ids: [] }
  }
  if (ids.length === 0) {
    return { valid: true, ids }
  }
  const existing = await tagModel.model_getTagByIds(ids)
  const missing = ids.filter((id) => !existing.some((tag) => tag.id === id))
  if (missing.length > 0) {
    return { valid: false, message: `标签不存在: ${missing.join(", ")}`, ids: [] }
  }
  return { valid: true, ids }
}

async function validateBlogWithParent(childBlog: SQLBlog, parentBlog?: SQLBlog | null): Promise<void> {
  if (parentBlog === undefined) {
    if (childBlog.parent_id !== null) {
      const [found] = await model_getBlogByIds(childBlog.parent_id!)
      parentBlog = found
    } else {
      parentBlog = null
    }
  }
  if (parentBlog !== null && parentBlog !== undefined) {
    if (parentBlog.is_published !== childBlog.is_published && parentBlog.is_published === 0) {
      throw new Error("父博客未发布的前提下，子博客无法发布")
    }
  }
}

function formatBlogTree(root: SQLBlog, children: SQLBlog[]): BlogTree {
  const rootTree = root as BlogTree
  rootTree.children = []
  const map = new Map<number, BlogTree>()
  children.forEach((item) => {
    const node = item as BlogTree
    node.children = []
    map.set(item.id, node)
  })
  map.set(root.id, rootTree)
  for (let i = 0; i < children.length; i++) {
    const parent = map.get(children[i].parent_id!)
    if (!parent) {
      console.log("这个id的父节点找不到", children[i].id)
      continue
    }
    parent.children.push(map.get(children[i].id)!)
  }
  return rootTree
}

function getUpdatePaths(
  currentPath: string,
  root: BlogTree[],
  updateData: BatchUpdateBlogItem[],
  needUnpublish: boolean
): BatchUpdateBlogItem[] {
  root.forEach((item) => {
    const updateItem: BatchUpdateBlogItem = { id: item.id, path: currentPath }
    if (needUnpublish) {
      updateItem.is_published = 0
    }
    updateData.push(updateItem)
    if (item.children.length > 0) {
      getUpdatePaths(`${currentPath}/${item.id}`, item.children, updateData, needUnpublish)
    }
  })
  return updateData
}

// 创建博客
export async function createBlog(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  const body: CreateBlogInput = ctx.request.body as CreateBlogInput
  const { title, content, is_published = 0, parent_id = null, prev_id = null, tag_ids } = body

  // tag_ids 必传，只能是数组；空数组 [] 表示不打标签（setBlogTags 里"只删不插"即重置）
  if (!Array.isArray(tag_ids)) {
    response.badRequest(ctx, "tag_ids 必传且必须是数组（无标签传空数组 []）")
    return
  }
  const check = await normalizeTagIds(tag_ids)
  if (!check.valid) {
    response.badRequest(ctx, check.message!)
    return
  }
  const tagIds = check.ids

  let path = "/"
  if (parent_id !== null || prev_id !== null) {
    let queryArr = []
    let parentBlog: SQLBlog | null = null
    if(parent_id) queryArr.push(parent_id);
    if(prev_id) queryArr.push(prev_id);
    const respones = await model_getBlogByIds(queryArr);
    // 验证节点是否存在的
    for(let i = 0; i < respones.length; i++) {
      if(parent_id === queryArr[i]) {
        parentBlog = respones[i]
        if(respones[i] === null) {
          response.badRequest(ctx, "父节点不存在，创建失败")
          return
        }
      } else if(prev_id === queryArr[i] && respones[i] === null) { // 说明前序节点不存在
        response.badRequest(ctx, "前序节点不存在，创建失败")
        return 
      }
    }
    if(parent_id !== null && parentBlog !== null) {
      if (parentBlog.folder_id !== Number(folderId)) {
        response.badRequest(ctx, "新建文件必须同属父文件所在文件夹下")
        return
      }
      if (parentBlog.is_published !== is_published && parentBlog.is_published === 0) {
        response.badRequest(ctx, "父博客未发布的前提下，无法直接创建发布状态的子博客")
        return
      }
      const parentIds = extractNumbersFromSlash(parentBlog.path)
      path = parent_id !== null ? `/${parentIds.length === 0 ? "" : parentIds.join("/") + "/"}${parent_id}` : `/`
    }
  }

  try {
    const sortIndex = await model_getSortIndexByPrevId(parent_id, prev_id)
    // 简介：插入时从 content 的 <blockquote> 标签内截取纯文本
    const descInfo = extractBlockquote(content ?? "")
    const value = await model_insertBlog({ title, content, is_published, folder_id: Number(folderId), parent_id, path, sort_index: sortIndex, desc_info: descInfo })
    // 有标签才写关联表（空数组跳过，新博客本来就没有标签）
    if (tagIds.length > 0) {
      await tagModel.model_setBlogTags(value.id, tagIds)
    }
    // 只回 tag_ids：标签名称/颜色由前端拉全量标签自行关联
    response.success(ctx, { ...value, tag_ids: tagIds })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to create blog", e)
  }
}

export async function getBlogByParentId(body: { blogId: number }): Promise<SQLBlog[]> {
  const { blogId } = body
  try {
    const blogs = await model_getBlogByIDFilter({ parentId: blogId })
    return blogs
  } catch (e) {
    throw e
  }
}

export async function getBlogsFilter(body: { title?: string; content?: string }): Promise<any> {
  const { title, content } = body
  try {
    const blogs = await model_getBlogsFilter({ title, content })
    return blogs
  } catch (e) {
    throw e
  }
}

export async function updateBlog(ctx: Context, next: Next): Promise<void> {
  const { blogId } = ctx.params
  const body: any = ctx.request.body || {}
  const { action } = body
  try {
    if (action === "CONTENT") {
      const { title = "无标题博客", content = "", tag_ids } = body.body || {}
      // tag_ids 必传：空数组 [] = 清空该博客的全部标签
      if (!Array.isArray(tag_ids)) {
        response.badRequest(ctx, "tag_ids 必传且必须是数组（无标签传空数组 []）")
        return
      }
      const check = await normalizeTagIds(tag_ids)
      if (!check.valid) {
        response.badRequest(ctx, check.message!)
        return
      }
      // 更新内容时同步重截简介，保证 desc_info 与最新 content 一致
      const descInfo = extractBlockquote(content)
      await model_updateBlog({ id: Number(blogId), title, content, update_date: new Date(), desc_info: descInfo })
      // 替换标签（先删后插，空数组 = 重置）
      await tagModel.model_setBlogTags(Number(blogId), check.ids)
      const [result] = await model_getBlogByIds(Number(blogId))
      // 只回 tag_ids，标签详情由前端拉全量标签自行关联
      response.success(ctx, { ...result, tag_ids: check.ids })
      await next()
    } else if (action === "MOVE") {
      const { folder_id, parent_id = null, prev_id = null } = body.body || {}
      let path = "/"
      let needUnpublish = false
      let parentBlog: SQLBlog | undefined, currentBlog: SQLBlog | undefined
      const foundIds = [Number(blogId)]
      if(parent_id !== null) foundIds.push(parent_id)
      if(prev_id !== null) foundIds.push(prev_id)
      const blogs = await model_getBlogByIds(foundIds);
      for(let i = 0; i < blogs.length; i++) { // 参数校验，父节点、前序节点以及当前节点是否存在
        if(blogs[i] === null) {
          if(foundIds[i] === Number(blogId)) {
            response.badRequest(ctx, "不存在该博客，无法移动")
            return
          } else if(foundIds[i] === parent_id) {
            response.badRequest(ctx, "不存在parent_id的博客")
            return
          } else if(foundIds[i] === prev_id) {
            response.badRequest(ctx, "不存在prev_id的博客")
            return
          }
        }
        if(blogs[i]?.id === parent_id) {
          parentBlog = blogs[i]!;
          const parentIds = extractNumbersFromSlash(parentBlog!.path)
          path = `${parentIds.length === 0 ? "/" : "/"+(parentIds.join("/") + "/")}${parent_id}`
        } else if(blogs[i]?.id === Number(blogId)) {
          currentBlog = blogs[i]!
        }
      }
      // 自身为发布状态，父节点为未发布状态，则需要将自身以及子节点全部下架再移动
      if(parentBlog && parentBlog.is_published !== currentBlog!.is_published && parentBlog.is_published === 0) {
        needUnpublish = true
      }

      const children = await model_getPathBlogs({ blogId: Number(blogId) })
      const root = formatBlogTree(currentBlog!, children || [])

      const updateData = getUpdatePaths(path, [root], [], needUnpublish)
      console.log("updateData:", updateData)
      const date = new Date()
      // 根据前序节点计算移动后的新 sort_index
      const sortIndex = await model_getSortIndexByPrevId(parent_id, prev_id)
      updateData.forEach((item) => {
        if (item.id === Number(blogId)) {
          item.parent_id = parent_id
          item.sort_index = sortIndex
        }
        item.update_date = date
      })
      await model_updateBlog(updateData)
      response.success(ctx, updateData)
      await next()
    } else  {
      // with_children 0：表示独自发布 1：表示连同子博客一起发布
      const { publish_status = 0, with_children = 0 } = body.body || {}
      const now = new Date()
      if (publish_status === 0) {
        // 下架：自身连同所有子博客一起下架（强制级联，不可选择）
        const children = await model_getPathBlogs({ blogId: Number(blogId) })
        const updateData: BatchUpdateBlogItem[] = [
          { id: Number(blogId), is_published: 0, update_date: now },
          ...children.map((item) => ({ id: item.id, is_published: 0, update_date: now })),
        ]
        await model_updateBlog(updateData)
        response.success(ctx, updateData)
      } else {
        // 发布：所有父博客必须先发布
        const [parentBlog] = await model_getParentBlog([Number(blogId)])
        if (parentBlog !== null && parentBlog.is_published !== 1) {
          response.badRequest(ctx, "发布博客必须先发布所有父博客")
          return
        }
        if (with_children === 1) {
          // 连同子博客一起发布：自身 + 所有后代批量更新
          const children = await model_getPathBlogs({ blogId: Number(blogId) })
          const updateData: BatchUpdateBlogItem[] = [
            { id: Number(blogId), is_published: 1, update_date: now },
            ...children.map((item) => ({ id: item.id, is_published: 1, update_date: now })),
          ]
          await model_updateBlog(updateData)
          response.success(ctx, updateData)
        } else {
          await model_updateBlog({ id: Number(blogId), is_published: 1, update_date: now })
          response.success(ctx, { id: Number(blogId), publish_status, update_date: now })
        }
      }
    }
  } catch (e: any) {
    response.internalError(ctx, "Failed to update blog", e)
  }
}

export async function getBlogById(ctx: Context, next: Next): Promise<void> {
  const { blogId } = ctx.params
  try {
    const [blog] = await model_getBlogByIds(Number(blogId))
    // 附带该博客的 tag_ids（编辑页回显）；名称/颜色由前端拉全量标签自行关联
    let tagIds: number[] = []
    if (blog) {
      tagIds = await tagModel.model_getBlogTagIds(blog.id)
    }
    response.success(ctx, blog ? { ...blog, tag_ids: tagIds } : blog)
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to get blog", e)
  }
}

export async function getBlogsByFolderId(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  try {
    const blogs = await model_getBlogByIDFilter({ folderId: Number(folderId) })
    response.success(ctx, { list: blogs ?? [] })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to get blogs by folder id", e)
  }
}

/**
 * 获取该博客下所有的子博客（全部后代，不含自身）：
 * 根据 path 模糊查询，返回 path 中包含 `/{blogId}` 片段的所有博客
 */
export async function getChildBlogs(blogId: number): Promise<SQLBlog[]> {
  try {
    return await model_getPathBlogs({ blogId })
  } catch (e) {
    throw e
  }
}

/**
 * 删除博客（软删除）：连同该博客下所有子博客一起删除
 */
export async function deleteBlog(ctx: Context, next: Next): Promise<void> {
  const { blogId } = ctx.params
  try {
    const [blog] = await model_getBlogByIds(Number(blogId))
    if (!blog) {
      response.badRequest(ctx, "博客不存在，删除失败")
      return
    }
    // 先按 path 模糊查询出全部子博客，再连同自身一起批量软删除
    const children = await getChildBlogs(Number(blogId))
    const deletedIds = [Number(blogId), ...children.map((item) => item.id)]
    await model_deleteBlog(deletedIds)
    response.success(ctx, { deletedIds })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to delete blog", e)
  }
}