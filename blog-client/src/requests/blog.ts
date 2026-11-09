import req, { type ApiResponse } from "./request"

/** 标签简要信息（C 端只展示，后端直接内嵌进博客响应） */
export type TagBrief = {
  id: number
  name: string
  color: string
}

/** 专题（已发布的根博客），对应 GET /api/client/blogs 的返回项（后端剔除 is_deleted/is_published） */
export type Topic = {
  id: number
  title: string
  content: string
  parent_id: number | null
  folder_id: number
  path: string
  create_date: string
  update_date: string
  sort_index: number
  /** 简介：后端插入/更新时从 content 的 <blockquote> 截取，存于 desc_info */
  summary: string
  /** 阅读次数：MySQL 已回写 + Redis 待回写的合并值 */
  view_times: number
  /** 标签：后端已合并 id/name/color，直接渲染 */
  tags: TagBrief[]
}

/** 博客树（GET /api/client/blogTree/:blogId 返回）：平铺结构，前端按 parent_id 自行组树 */
export type BlogTreeData = {
  blogs: Topic[]
  /** 所属专题（根博客）的 id */
  rootId: number
}

/** 分页信息（与后端 response.paginate 的返回结构一致） */
export type Pagination = {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 标签简要信息（筛选器用，GET /api/client/tags 返回项） */
export type ClientTag = {
  id: number
  name: string
  color: string
}

export const getTopics = (
  page: number,
  pageSize = 5,
  options: { tagIds?: number[]; rootOnly?: boolean } = {},
): Promise<{ items: Topic[]; pagination: Pagination }> => {
  const params: Record<string, string | number> = { page, pageSize }
  // 标签筛选：后端 OR 语义（命中任一选中标签即返回）
  if (options.tagIds && options.tagIds.length > 0) {
    params.tagIds = options.tagIds.join(",")
  }
  // rootOnly：只查根博客（侧栏"专题列表"用）
  if (options.rootOnly) {
    params.rootOnly = 1
  }
  return req
    .get<
      { items: Topic[]; pagination: Pagination },
      ApiResponse<{ items: Topic[]; pagination: Pagination }>
    >("/client/blogs", { params })
    .then((res) => res.data)
}

/** 全量标签列表（筛选器下拉用，公开接口） */
export const getAllTags = (): Promise<ClientTag[]> => {
  return req
    .get<{ list: ClientTag[] }, ApiResponse<{ list: ClientTag[] }>>("/client/tags")
    .then((res) => res.data.list ?? [])
}

/** 热门文章 TOP N（GET /api/client/blogs/hot，按阅读量倒排） */
export const getHotBlogs = (limit = 10): Promise<Topic[]> => {
  return req
    .get<{ list: Topic[] }, ApiResponse<{ list: Topic[] }>>("/client/blogs/hot", {
      params: { limit },
    })
    .then((res) => res.data.list ?? [])
}

/** 文章详情（GET /api/client/blogs/:blogId）：打开即记一次阅读（后端 Redis INCR） */
export const getBlogDetail = (blogId: number): Promise<Topic> => {
  return req
    .get<Topic, ApiResponse<Topic>>(`/client/blogs/${blogId}`)
    .then((res) => res.data)
}

/** 所属专题树（GET /api/client/blogTree/:blogId）：平铺结构，前端按 parent_id 组树 */
export const getBlogTree = (blogId: number): Promise<BlogTreeData> => {
  return req
    .get<BlogTreeData, ApiResponse<BlogTreeData>>(`/client/blogTree/${blogId}`)
    .then((res) => res.data)
}
