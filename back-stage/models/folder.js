import sqlPool from "./sql.js";

export function getFolderByID({ id }) {
  return sqlPool.query('SELECT id, title, desc_info, create_date FROM blog_folder WHERE id = ? AND is_deleted = 0', [id])
  .then(([rows]) => {
    return rows[0];
  });
}

export function getFolderList() { //todo 目前并不会有很多文件夹 所以暂时不分页
  return sqlPool.query('SELECT id, title, desc_info, create_date FROM blog_folder WHERE is_deleted = 0')
  .then(([rows]) => rows);
}

export function createFolder({ title, desc_info, create_date = new Date() }) {
  return sqlPool.query('INSERT INTO blog_folder (title, desc_info, create_date) VALUES (?, ?, ?)', [title, desc_info, create_date]);
}

export function deleteFolder({ id }) {
  return sqlPool.query('UPDATE blog_folder SET is_deleted = 1 WHERE id = ?', [id]);
}

export function updateFolder({ id, title, desc_info }) {
  return sqlPool.query('UPDATE blog_folder SET title = ?, desc_info = ? WHERE id = ?', [title, desc_info, id]);
}