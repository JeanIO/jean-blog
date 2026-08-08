import sqlPool from './sql.js';
const TABLE_NAME = "blog_manage";

async function model_insertBlog(blog) {
  let now = new Date()
  const { title, content, is_published, folder_id, parent_id, path } = blog
  const sql = `INSERT INTO ${TABLE_NAME} (title, content, is_published, folder_id, parent_id, path, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, content || '', is_published || 0, folder_id, parent_id, path || '', now, now];
  try {
    const value = await sqlPool.query(sql, params);
    const id = value[0].insertId;
    return { id, title, content, is_published, parent_id, folder_id, create_date: now, update_date: now };
  } catch (e) {
    throw e;
  }
}

// todo 获取博客详情

async function model_getBlogByIds(ids, keys) {
  let params
  if (!Array.isArray(ids)) {
    params = [ids]
  } else {
    params = ids
  }
  let selectKey = (keys || ["id", "title", "content", "is_published", "parent_id", "folder_id", "create_date", "update_date", "path"]).join(',')
  const sql = `SELECT ${selectKey} FROM ${TABLE_NAME} WHERE id IN (${params.map(_ => '?').join(',')}) AND is_deleted = 0`;

  try {
    const blog = await sqlPool.query(sql, params);
 
    /* blog[0]格式 [
    {
      id: 5,
      title: '再次更新测试博客',
      content: '再也不用给我擦皮鞋了',
      is_published: 0,
      parent_id: null,
      folder_id: 158,
      create_date: 2026-01-04T13:02:08.000Z,
      update_date: 2026-01-05T02:12:49.000Z
    }
  ],
  */
    return blog[0];
  } catch (e) {
    throw e;
  }
}

async function model_getPathBlogs(body) {
  const { isDeleted = 0, blogId } = body
  const sql = `SELECT id, title, is_published, parent_id, folder_id, path, create_date, update_date FROM ${TABLE_NAME} WHERE is_deleted = ? AND path LIKE ?`;
  const params = [isDeleted, `%${blogId}%`];
  try {
    const blogs = await sqlPool.query(sql, params);
    return blogs[0] || [];
  } catch (e) {
    throw e;
  }
}

async function model_getBlogByIDFilter(filter) {
  const { blogId, parentId, folderId } = filter
  try {
    let sql = `SELECT id, title, is_published, parent_id, folder_id, create_date, update_date FROM ${TABLE_NAME} WHERE 1=1 AND is_deleted = 0`;
    let params = []
    if (blogId !== undefined) {
      sql += " AND id = ?";
      params.push(blogId);
    }
    if (parentId !== undefined) { // parentId可以为null，表示为root
      if (parentId === null) {
        sql += " AND parent_id IS NULL";
      } else {
        sql += " AND parent_id = ?";
        params.push(parentId);
      }
    }
    if (folderId) { // 业务中folder_id不可能为null 
      sql += " AND folder_id = ?";
      params.push(folderId);
    }

    const [blogs] = await sqlPool.query(sql, params);
    return blogs || [];
  } catch (e) {
    throw e;
  }
}
// 博客模糊查询
async function model_getBlogsFilter(filter) {
  const sql = `SELECT * FROM ${TABLE_NAME}`;
  const params = [];
  if (filter.title) {
    sql += " AND title LIKE ?";
    params.push(`%${filter.title}%`);
  }
  if (filter.content) {
    sql += " AND content LIKE ?";
    params.push(`%${filter.content}%`);
  }
  return sqlPool.query(sql, params);
}

// 删除指定博客
async function model_deleteBlog(id) {
  const sql = `UPDATE ${TABLE_NAME} SET is_deleted = 1 WHERE id = ?`;
  const params = [id];
  return sqlPool.query(sql, params);
}

async function model_updateBlog(blog) {
  const keys = ["title", "content", "is_published", "parent_id", "update_date", "path"]
  if (Array.isArray(blog)) { // 批量更新
    let params = []
    let sql = `UPDATE ${TABLE_NAME} SET`
    const ids = blog.map(item => item.id);
    keys.forEach((key) => {
      blog.forEach(item => {
        if (item[key] !== undefined) {
          sql += ` ${key} = CASE WHEN id = ? THEN ? ELSE ${key} END,`
          params.push(item.id, item[key]);
        }
      })
    })
    // slice 删除最后的逗号
    sql = sql.slice(0, -1) + ` WHERE id IN (${ids.join(',')})`
    console.log("sql:", sql)
    try {
      await sqlPool.query(sql, params);
      const blogs = await model_getBlogByIds(ids, ["update_date"]);
      return blogs;
    } catch (e) {
      throw e;
    }
  } else { // 单条更新
    let params = []
    let sql = `UPDATE ${TABLE_NAME} SET`
    const id = blog.id
    keys.forEach((key, index) => {
      if (blog[key] !== undefined) {
        sql += ` ${key} = ?,`
        params.push(blog[key]);
      }
    })
    sql = sql.slice(0, -1) + ` WHERE id = ?`
    params.push(id);
    try {
      const result = await sqlPool.query(sql, params);
      return result[0];
    } catch (e) {
      throw e;
    }
  }
}

async function model_getParentBlog(ids) {
  // const sql = `SELECT id, folder_id, path FROM ${TABLE_NAME} WHERE id = ?`;
  const sql = `SELECT 
  parent.id,
	parent.title,
  parent.is_published,
	parent.create_date,
	parent.update_date
FROM ${TABLE_NAME} AS child
LEFT JOIN ${TABLE_NAME} AS parent 
  ON child.parent_id = parent.id 
  AND parent.is_deleted = 0
WHERE 
  child.id in (${ids.join(',')})
  AND child.is_deleted = 0;`
  try {
    const [results] = await sqlPool.query(sql);
    return (results || []).map(item => item.id === null ? null : item)
  } catch (e) {
    throw e;
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
  model_getParentBlog
}