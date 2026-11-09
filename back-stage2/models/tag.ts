import sqlPool from "./sql.js"
import type { Tag, TagBrief, CreateTagInput } from "../types/models.js"

/**
 * 建表 DDL（已执行，留档）：
 *
 * CREATE TABLE blog_tag (
 *   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(20) NOT NULL COMMENT '标签名',
 *   color CHAR(7) NOT NULL DEFAULT '#1890ff' COMMENT '颜色，十六进制 #RRGGBB',
 *   create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
 *   UNIQUE KEY uk_name (name)
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='博客标签';
 *
 * CREATE TABLE blog_tag_rel (
 *   id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 *   blog_id BIGINT UNSIGNED NOT NULL COMMENT '博客 id（与 blog_manage.id 类型一致）',
 *   tag_id INT UNSIGNED NOT NULL COMMENT '标签 id',
 *   UNIQUE KEY uk_blog_tag (blog_id, tag_id),
 *   KEY idx_tag_id (tag_id),
 *   CONSTRAINT fk_rel_blog FOREIGN KEY (blog_id) REFERENCES blog_manage (id) ON DELETE CASCADE,
 *   CONSTRAINT fk_rel_tag FOREIGN KEY (tag_id) REFERENCES blog_tag (id) ON DELETE CASCADE
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='博客-标签关联';
 */

const TAG_TABLE = "blog_tag"
const REL_TABLE = "blog_tag_rel"

/** 创建标签；名字重复时抛出 ER_DUP_ENTRY，由控制器转成 409 */
async function model_createTag(input: CreateTagInput): Promise<Tag> {
  const { name, color = "#1890ff" } = input
  const sql = `INSERT INTO ${TAG_TABLE} (name, color) VALUES (?, ?)`
  try {
    const value: any = await sqlPool.query(sql, [name, color])
    return { id: value[0].insertId, name, color, create_date: new Date() }
  } catch (e) {
    throw e
  }
}

/** 标签列表：聚合每张标签被多少篇博客引用（看板"标签分布"也走这里） */
async function model_getTags(): Promise<Tag[]> {
  const sql = `SELECT t.id, t.name, t.color, t.create_date, COUNT(r.tag_id) AS blog_count
FROM ${TAG_TABLE} t
LEFT JOIN ${REL_TABLE} r ON r.tag_id = t.id
GROUP BY t.id
ORDER BY t.create_date DESC`
  try {
    const [tags]: any = await sqlPool.query(sql)
    return (tags || []).map((tag: any) => ({ ...tag, blog_count: Number(tag.blog_count) }))
  } catch (e) {
    throw e
  }
}

/** 按 id 批量查标签（校验 tag_ids 是否都存在用） */
async function model_getTagByIds(ids: number[]): Promise<Tag[]> {
  if (ids.length === 0) return []
  const sql = `SELECT id, name, color FROM ${TAG_TABLE} WHERE id IN (${ids.map(() => "?").join(",")})`
  try {
    const [tags]: any = await sqlPool.query(sql, ids)
    return (tags || []) as Tag[]
  } catch (e) {
    throw e
  }
}

/** 某篇博客当前的标签 id 列表（前端拉全量标签后自行按 id 关联名称/颜色） */
async function model_getBlogTagIds(blogId: number): Promise<number[]> {
  const sql = `SELECT tag_id FROM ${REL_TABLE} WHERE blog_id = ? ORDER BY id ASC`
  try {
    const [rows]: any = await sqlPool.query(sql, [blogId])
    return (rows || []).map((row: any) => Number(row.tag_id))
  } catch (e) {
    throw e
  }
}

/** 批量查多篇博客的标签简要信息（一条 SQL，避免列表页 N+1） */
async function model_getTagsByBlogIds(blogIds: number[]): Promise<Map<number, TagBrief[]>> {
  const map = new Map<number, TagBrief[]>()
  if (blogIds.length === 0) return map
  const sql = `SELECT r.blog_id, t.id, t.name, t.color
FROM ${REL_TABLE} r
JOIN ${TAG_TABLE} t ON t.id = r.tag_id
WHERE r.blog_id IN (${blogIds.map(() => "?").join(",")})
ORDER BY r.id ASC`
  try {
    const [rows]: any = await sqlPool.query(sql, blogIds)
    ;(rows || []).forEach((row: any) => {
      const blogId = Number(row.blog_id)
      if (!map.has(blogId)) map.set(blogId, [])
      map.get(blogId)!.push({ id: row.id, name: row.name, color: row.color })
    })
    return map
  } catch (e) {
    throw e
  }
}

/**
 * 替换博客的全部标签（先删后插）。
 * 事务保证原子：插新标签失败时旧标签也一并回滚，不留"博客没有标签"的中间状态。
 */
async function model_setBlogTags(blogId: number, tagIds: number[]): Promise<void> {
  try {
    await sqlPool.transaction(async (query) => {
      await query(`DELETE FROM ${REL_TABLE} WHERE blog_id = ?`, [blogId])
      if (tagIds.length > 0) {
        const values = tagIds.map(() => "(?, ?)").join(", ")
        const params = tagIds.flatMap((tagId) => [blogId, tagId])
        await query(`INSERT INTO ${REL_TABLE} (blog_id, tag_id) VALUES ${values}`, params)
      }
    })
  } catch (e) {
    throw e
  }
}

/** 删除标签；关联关系由外键 ON DELETE CASCADE 自动清掉，这里也显式删一遍以保稳妥 */
async function model_deleteTag(id: number): Promise<void> {
  try {
    await sqlPool.transaction(async (query) => {
      await query(`DELETE FROM ${REL_TABLE} WHERE tag_id = ?`, [id])
      await query(`DELETE FROM ${TAG_TABLE} WHERE id = ?`, [id])
    })
  } catch (e) {
    throw e
  }
}

export {
  model_createTag,
  model_getTags,
  model_getTagByIds,
  model_getBlogTagIds,
  model_getTagsByBlogIds,
  model_setBlogTags,
  model_deleteTag,
}
