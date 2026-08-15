import type { SQLBlog, BlogBody } from "../../types/models"

export interface InsertBlog extends BlogBody {
  sort_index: number
}