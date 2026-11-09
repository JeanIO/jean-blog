import { BlogBody } from "../../types/models"

/** 创建博客入参；prev_id 仅用于计算 sort_index，不属于博客本身，可缺省 */
export interface CreateBlogInput extends BlogBody {
  prev_id: number
  /** 标签 id 数组：必传，无标签传空数组 []（空数组 = 重置标签） */
  tag_ids: number[]
}

/** 更新博客入参（单条，除 id 外均可选）；prev_id 仅在 MOVE 重排序时需要 */
export interface UpdateBlogInput {
  id: number
  title: string
  content?: string
  is_published?: number
  parent_id?: number | null
  path?: string
  update_date?: Date
  prev_id?: number | null
}

export interface UpdateContentBlogInput {
  id: number,
  title: string,
  content: string
}

/** 更新博客入参（批量字段） */
export interface BatchUpdateBlogItem {
  id: number
  parent_id?: number | null
  path?: string
  update_date?: Date
  is_published?: number,
  sort_index?: number,
  folder_id?: number
}
