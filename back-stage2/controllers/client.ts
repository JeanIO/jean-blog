import type { Context } from "koa"
import { model_getPublishedBlogs, model_getBlogByIds, model_getPathBlogs, model_getHotBlogs } from "../models/blogManage.js"
import { model_getTagsByBlogIds, model_getTags } from "../models/tag.js"
import type { SQLBlog, TagBrief } from "../types/models.js"
import response from "../utils/response.js"
import { getRedis, getViewCountKey } from "../utils/redis.js"
import { extractNumbersFromSlash } from "../utils/str.js"

/**
 * 客户端文章结构：所有详情字段，剔除 is_deleted/is_published
 * （客户端只能看到已发布内容，不需要这两个标记位）
 * C 端只展示不改标签，直接内嵌 tags 简要信息（id/name/color），前端无需二次关联
 */
function toClientBlog(blog: SQLBlog, tags: TagBrief[] = []) {
  return {
    id: blog.id,
    title: blog.title,
    content: blog.content,
    parent_id: blog.parent_id,
    folder_id: blog.folder_id,
    path: blog.path,
    create_date: blog.create_date,
    update_date: blog.update_date,
    sort_index: blog.sort_index,
    summary: blog.desc_info ?? "",
    view_times: blog.view_times ?? 0,
    tags,
  }
}

/**
 * 客户端博客专题列表（分页，query 参数 page/pageSize）：
 * 约定只查根节点（parent_id 为 NULL）且已发布的博客，每个根博客即一个"专题"。
 * 返回文章全部详情字段（除 is_deleted/is_published），详情接口仍用于阅读计数。
 */
export async function getPublishedTopics(ctx: Context): Promise<void> {
  try {
    // 校验为安全正整数：page 默认 1，pageSize 默认 5、上限 50（后续直接内联进 LIMIT）
    const rawPage = Number(ctx.query.page)
    const rawPageSize = Number(ctx.query.pageSize)
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(50, Math.floor(rawPageSize)) : 5
    // 标签筛选（逗号分隔的 tag id，非法值直接忽略）；rootOnly 只查根博客（侧栏"专题列表"）
    const rawTagIds = String(ctx.query.tagIds ?? "")
    const tagIds = rawTagIds
      .split(",")
      .map(s => Number(s.trim()))
      .filter(n => Number.isInteger(n) && n > 0)
    const rootOnly = ctx.query.rootOnly === "1" || ctx.query.rootOnly === "true"
    const { blogs, total } = await model_getPublishedBlogs(page, pageSize, { tagIds, rootOnly })
    // 一次批量 SQL 取全部分页内博客的标签，避免逐条查询
    const tagsMap = await model_getTagsByBlogIds(blogs.map(b => b.id))
    const items = blogs.map(b => toClientBlog(b, tagsMap.get(b.id) ?? []))
    response.paginate(ctx, items, total, page, pageSize, "获取专题列表成功")
  } catch (e: any) {
    response.internalError(ctx, "获取专题列表失败", e)
  }
}

/**
 * 客户端标签全量列表（筛选器用）：公开接口，不做鉴权
 */
export async function getClientTags(ctx: Context): Promise<void> {
  try {
    const tags = await model_getTags()
    response.success(ctx, { list: tags }, "获取标签列表成功")
  } catch (e: any) {
    response.internalError(ctx, "获取标签列表失败", e)
  }
}

/**
 * 客户端热门文章 TOP N（?limit 默认 10、上限 50）：已发布博客按阅读量倒排
 */
export async function getHotBlogs(ctx: Context): Promise<void> {
  try {
    const rawLimit = Number(ctx.query.limit)
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(50, Math.floor(rawLimit)) : 10
    const blogs = await model_getHotBlogs(limit)
    const tagsMap = await model_getTagsByBlogIds(blogs.map(b => b.id))
    const items = blogs.map(b => toClientBlog(b, tagsMap.get(b.id) ?? []))
    response.success(ctx, { list: items }, "获取热门文章成功")
  } catch (e: any) {
    response.internalError(ctx, "获取热门文章失败", e)
  }
}

/**
 * 客户端文章详情：打开正文即记一次阅读
 * 计数走 Redis INCR（快、原子），由 utils/viewCountJob 定时回写 MySQL；
 * 阅读数 = 已回写 MySQL 的 view_times + Redis 里待回写的增量。
 */
export async function getBlogDetail(ctx: Context): Promise<void> {
  const blogId = Number(ctx.params.blogId)
  if (!Number.isFinite(blogId) || blogId <= 0) {
    response.badRequest(ctx, "无效的博客 id")
    return
  }
  try {
    const [blog] = await model_getBlogByIds(blogId)
    if (!blog || blog.is_published !== 1) {
      response.notFound(ctx, "文章不存在或未发布")
      return
    }

    // Redis 计数失败（如 Redis 没起）不影响读文章，只影响计数
    let pendingViews = 0
    try {
      // INCR 返回值就是该 key 最新的待回写计数，一次调用搞定"加一 + 取数"
      pendingViews = await getRedis().incr(getViewCountKey(blogId))
    } catch (e: any) {
      console.error(`[viewCount] Redis 计数失败: ${e.message}`)
    }

    const tagsMap = await model_getTagsByBlogIds([blogId])
    response.success(ctx, {
      ...toClientBlog(blog, tagsMap.get(blogId) ?? []),
      view_times: (blog.view_times || 0) + pendingViews,
    }, "获取文章详情成功")
  } catch (e: any) {
    response.internalError(ctx, "获取文章详情失败", e)
  }
}

/**
 * 客户端博客树：根据任意博客 id，定位它所属的根博客（专题）
 * 返回平铺结构 { blogs, rootId }：blogs = 根博客 + 所有已发布后代，
 * 前端利用 parent_id 自行组装树结构。
 */
export async function getBlogTree(ctx: Context): Promise<void> {
  const blogId = Number(ctx.params.blogId)
  if (!Number.isFinite(blogId) || blogId <= 0) {
    response.badRequest(ctx, "无效的博客 id")
    return
  }
  try {
    const [blog] = await model_getBlogByIds(blogId)
    if (!blog || blog.is_published !== 1) {
      response.notFound(ctx, "博客不存在或未发布")
      return
    }

    // 通过 path 拆解出根博客 id：path 形如 "/5/12"，第一个数字就是根祖先；
    // 根博客自身 parent_id 为 NULL，直接用自身 id
    let rootId = blogId
    if (blog.parent_id !== null) {
      const ancestorIds = extractNumbersFromSlash(blog.path)
      if (ancestorIds.length > 0) {
        rootId = ancestorIds[0]
      }
    }

    const [root] = await model_getBlogByIds(rootId)
    if (!root || root.is_published !== 1) {
      response.notFound(ctx, "所属专题不存在或未发布")
      return
    }
    // isPublished: 1 — 客户端只看到已发布内容（按 sort_index 排序，已加在 model 里）
    const children = await model_getPathBlogs({ blogId: rootId, isPublished: 1 })
    const allBlogs = [root, ...children]
    const tagsMap = await model_getTagsByBlogIds(allBlogs.map(b => b.id))
    const blogs = allBlogs.map(b => toClientBlog(b, tagsMap.get(b.id) ?? []))
    response.success(ctx, { blogs, rootId }, "获取博客树成功")
  } catch (e: any) {
    response.internalError(ctx, "获取博客树失败", e)
  }
}
