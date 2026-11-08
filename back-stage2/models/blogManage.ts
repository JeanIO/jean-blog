import sqlPool from "./sql.js"
import type { BlogFilter, BatchUpdateBlogItem, SQLBlog } from "../types/models.js"
import type { InsertBlog } from "./types/blogManage.js"

const TABLE_NAME = "blog_manage"

/** blog_manage 表业务字段（查询关键字集中维护，新增字段时只需改这里） */
export const BLOG_FIELDS = [
  "id",
  "title",
  "content",
  "is_published",
  "parent_id",
  "folder_id",
  "path",
  "create_date",
  "update_date",
  "sort_index",
  "desc_info",
  "view_times",
] as const

export async function model_getSortIndexByPrevId(parentId: number | null, prevId: number | null): Promise<number> {
  let prevSortIndex = 0
  try {
    if (prevId) {
      const [value] = await model_getBlogByIds(prevId)
      prevSortIndex = (value as SQLBlog).sort_index
    const sql =
    `SELECT ${BLOG_FIELDS.join(", ")}
     FROM ${TABLE_NAME}
     WHERE parent_id <=> ? AND sort_index > ?
     ORDER BY sort_index DESC LIMIT 1`
    const [nextValue] = await sqlPool.query(sql, [parentId, prevSortIndex]);
    console.log( "nextValue:", nextValue)
    if(nextValue.length) {
      return (nextValue[0].sort_index + prevSortIndex) / 2
    }
    return prevSortIndex + 8000
  }
  return 0
  } catch (e) {
    throw e;
  }
}

async function model_insertBlog(blog: InsertBlog): Promise<SQLBlog> {
  const now = new Date()
  const { title, content = "", is_published = 0, folder_id, parent_id = null, path = "", sort_index, desc_info = null } = blog
  const sql = `INSERT INTO ${TABLE_NAME}
  (title, content, is_published, folder_id, parent_id, path, create_date, update_date, sort_index, desc_info ) VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  const params = [title, content, is_published, folder_id, parent_id, path, now, now, sort_index, desc_info]
  try {
    const value: any = await sqlPool.query(sql, params)
    const id = value[0].insertId
    // view_times 由 DB 默认值 0 初始化，增长逻辑由 client 相关接口维护，这里不写入
    return { id, title, content: content!, is_published, parent_id, folder_id, path: path!, create_date: now, update_date: now, sort_index , view_times: 0, desc_info }
  } catch (e) {
    throw e
  }
}

async function model_getBlogByIds(ids: number | number[], filter?: Partial<SQLBlog>): Promise<(SQLBlog | null)[]> {
  let params: any[]
  if (!Array.isArray(ids)) {
    params = [ids]
  } else {
    params = ids
  }
  const selectKey =  ([...BLOG_FIELDS]).filter(item => !filter || filter[item] === undefined).join(",")
  let sql = `SELECT ${selectKey} FROM ${TABLE_NAME} WHERE id IN (${params.map(() => "?").join(",")}) AND is_deleted = 0`
  if(filter) {
    Object.entries(filter).forEach(([k, v]) => {
      sql += `AND ${k} = ?`
      params.push(v)
    })
  }

  try {
    const res = await sqlPool.query(sql, params)
    const blogs: SQLBlog[] = res[0]
    
    const blogMapper = new Map<number, SQLBlog>()
    blogs.forEach((b) => {
      blogMapper.set(b.id, b)
    })
    return params.map(id => {
      return blogMapper.get(id) || null
    })
  } catch (e) {
    throw e
  }
}

async function model_getPathBlogs(body: { isDeleted?: number; isPublished?: number; blogId: number }): Promise<SQLBlog[]> {
  const { isDeleted = 0, isPublished, blogId } = body
  // 返回 blogId 的所有后代（不含自身）；精确匹配 path 片段，避免 id 子串误匹配（如 1 匹配到 12）
  // 注意：根级节点的 path 为 "/"，自身 id 不出现在 path 中，需要自身时应由调用方显式处理
  let sql = `SELECT ${BLOG_FIELDS.join(", ")} FROM ${TABLE_NAME} WHERE is_deleted = ?`
  const params: any[] = [isDeleted]
  if (isPublished !== undefined) {
    sql += " AND is_published = ?"
    params.push(isPublished)
  }
  sql += " AND path LIKE ? ORDER BY sort_index ASC"
  params.push(`%/${blogId}%`)
  try {
    const blogs: any = await sqlPool.query(sql, params)
    return (blogs[0] || []) as SQLBlog[]
  } catch (e) {
    throw e
  }
}

async function model_getBlogByIDFilter(filter: BlogFilter): Promise<SQLBlog[]> {
  const { blogId, parentId, folderId } = filter
  try {
    let sql = `SELECT ${BLOG_FIELDS.join(", ")} FROM ${TABLE_NAME} WHERE 1=1 AND is_deleted = 0`
    const params: any[] = []
    if (blogId !== undefined) {
      sql += " AND id = ?"
      params.push(blogId)
    }
    if (parentId !== undefined) {
      if (parentId === null) {
        sql += " AND parent_id IS NULL"
      } else {
        sql += " AND parent_id = ?"
        params.push(parentId)
      }
    }
    if (folderId) {
      sql += " AND folder_id = ?"
      params.push(folderId)
    }

    const [blogs]: any = await sqlPool.query(sql, params)
    return (blogs || []) as SQLBlog[]
  } catch (e) {
    throw e
  }
}

async function model_getBlogsFilter(filter: BlogFilter): Promise<any> {
  let sql = `SELECT * FROM ${TABLE_NAME}`
  const params: any[] = []
  if (filter.title) {
    sql += " AND title LIKE ?"
    params.push(`%${filter.title}%`)
  }
  if (filter.content) {
    sql += " AND content LIKE ?"
    params.push(`%${filter.content}%`)
  }
  return sqlPool.query(sql, params)
}

async function model_deleteBlog(id: number): Promise<any> {
  const sql = `UPDATE ${TABLE_NAME} SET is_deleted = 1 WHERE id = ?`
  const params = [id]
  return sqlPool.query(sql, params)
}

async function model_updateBlog(blog: Partial<SQLBlog> & {id: SQLBlog["id"]} | (Partial<SQLBlog> & {id: SQLBlog["id"]})[]): Promise<any> {
  const keys = ["title", "content", "is_published", "parent_id", "update_date", "path", "sort_index", "desc_info"]
  if (Array.isArray(blog)) {
    const params: any[] = []
    let sql = `UPDATE ${TABLE_NAME} SET`
    const ids = blog.map(item => item.id)
    keys.forEach((key) => {
      blog.forEach(item => {
        if ((item as any)[key] !== undefined) {
          sql += ` ${key} = CASE WHEN id = ? THEN ? ELSE ${key} END,`
          params.push(item.id, (item as any)[key])
        }
      })
    })
    sql = sql.slice(0, -1) + ` WHERE id IN (${ids.join(",")})`
    
    try {
      await sqlPool.query(sql, params)
      const blogs = await model_getBlogByIds(ids)
      return blogs
    } catch (e) {
      throw e
    }
  } else {
    const params: any[] = []
    let sql = `UPDATE ${TABLE_NAME} SET`
    const id = blog.id
    keys.forEach((key) => {
      if ((blog as any)[key] !== undefined) {
        sql += ` ${key} = ?,`
        params.push((blog as any)[key])
      }
    })
    sql = sql.slice(0, -1) + ` WHERE id = ?`
    params.push(id)
    try {
      const result: any = await sqlPool.query(sql, params)
      return result[0]
    } catch (e) {
      throw e
    }
  }
}

async function model_getParentBlog(ids: number[]): Promise<(SQLBlog | null)[]> {
  const parentFields = BLOG_FIELDS.map((field) => `parent.${field}`).join(",\n  ")
  const sql = `SELECT
  ${parentFields}
FROM ${TABLE_NAME} AS child
LEFT JOIN ${TABLE_NAME} AS parent
  ON child.parent_id = parent.id
  AND parent.is_deleted = 0
WHERE
  child.id in (${ids.join(",")})
  AND child.is_deleted = 0;`
  try {
    const [results]: any = await sqlPool.query(sql)
    return (results || []).map((item: any) => item.id === null ? null : (item as SQLBlog))
  } catch (e) {
    throw e
  }
}

/**
 * 把 Redis 汇总来的阅读增量写回 MySQL（配合 utils/viewCountJob 的定时回写任务）
 * 单条 UPDATE 原子累加，不需要先读再写
 */
async function model_addViewTimes(id: number, count: number): Promise<void> {
  const sql = `UPDATE ${TABLE_NAME} SET view_times = view_times + ? WHERE id = ?`
  try {
    await sqlPool.query(sql, [count, id])
  } catch (e) {
    throw e
  }
}

/**
 * 客户端博客列表（分页）：按更新时间倒排
 * @param options.rootOnly 只查根博客（parent_id 为 NULL，侧栏"专题列表"用）
 * @param options.tagIds   按标签筛选：命中任一标签即返回（OR 语义）
 * @returns 当前页博客 + 符合条件的总数
 */
async function model_getPublishedBlogs(
  page: number,
  pageSize: number,
  options: { tagIds?: number[]; rootOnly?: boolean } = {},
): Promise<{ blogs: SQLBlog[]; total: number }> {
  const { tagIds = [], rootOnly = false } = options
  let where = `b.is_published = 1
  AND b.is_deleted = 0`
  if (rootOnly) {
    where += `\n  AND b.parent_id IS NULL`
  }
  const params: any[] = []
  if (tagIds.length > 0) {
    where += `\n  AND EXISTS (SELECT 1 FROM blog_tag_rel r WHERE r.blog_id = b.id AND r.tag_id IN (${tagIds.map(() => "?").join(",")}))`
    params.push(...tagIds)
  }
  try {
    const [countRows]: any = await sqlPool.query(
      `SELECT COUNT(*) AS total FROM ${TABLE_NAME} AS b WHERE ${where}`,
      params,
    )
    const total = countRows[0]?.total ?? 0

    // LIMIT 偏移量, 条数；page/pageSize 已由控制器校验为安全正整数，此处直接内联
    // （mysql2 的 execute 预编译对 LIMIT ? 占位符支持有问题）
    // 客户端列表需要文章全字段（除 is_deleted/is_published），直接带出 BLOG_FIELDS
    // 按更新时间倒排：最近更新的专题排在最前
    const sql = `SELECT
  ${BLOG_FIELDS.map(f => `b.${f}`).join(", ")}
FROM ${TABLE_NAME} AS b
WHERE ${where}
ORDER BY b.update_date DESC
LIMIT ${(page - 1) * pageSize}, ${pageSize}`
    const [blogs]: any = await sqlPool.query(sql, params)
    return { blogs: (blogs || []) as SQLBlog[], total }
  } catch (e) {
    throw e
  }
}

/**
 * 客户端热门文章 TOP N：已发布博客按阅读量倒排（并列按更新时间倒排）
 */
async function model_getHotBlogs(limit: number): Promise<SQLBlog[]> {
  const sql = `SELECT
  ${BLOG_FIELDS.map(f => `b.${f}`).join(", ")}
FROM ${TABLE_NAME} AS b
WHERE b.is_published = 1 AND b.is_deleted = 0
ORDER BY b.view_times DESC, b.update_date DESC
LIMIT ${limit}`
  try {
    const [blogs]: any = await sqlPool.query(sql)
    return (blogs || []) as SQLBlog[]
  } catch (e) {
    throw e
  }
}

export {
  model_updateBlog,
  model_insertBlog,
  model_getBlogByIds,
  model_getBlogsFilter,
  model_getBlogByIDFilter,
  model_deleteBlog,
  model_getPathBlogs,
  model_getParentBlog,
  model_getPublishedBlogs,
  model_getHotBlogs,
  model_addViewTimes,
}