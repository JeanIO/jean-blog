/** 更新博客入参（批量字段） */
export interface BatchUpdateBlogItem {
  id: number
  parent_id?: number | null
  path?: string
  update_date?: Date
  is_published?: number,
  folder_id: number
}