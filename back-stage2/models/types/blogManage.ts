import type { SQLBlog, BlogBody } from "../../types/models.js"

export interface InsertBlog extends BlogBody {
  sort_index: number
}