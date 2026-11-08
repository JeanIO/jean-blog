import req from "./request"

/** 标签（对应后端 GET /back-stage/tags 的返回项） */
export type TagItem = {
  id: number
  name: string
  color: string
  create_date: string
  /** 被多少篇博客引用（后端查询接口聚合返回） */
  blog_count?: number
}

/** 全量标签列表：选择器和看板共用 */
export const getTags = (): Promise<TagItem[]> => {
  return req.get("/back-stage/tags").then(res => {
    const { data: { list = [] } } = res
    return list as TagItem[]
  })
}

/** 新建标签（名称 ≤20 字、颜色 #RRGGBB），重名由后端 409 拦截 */
export const createTag = (name: string, color: string): Promise<TagItem> => {
  return req.post("/back-stage/tags", { name, color }).then(res => res.data)
}

/** 删除标签（后端事务级联清掉所有博客上的关联） */
export const deleteTag = (id: number): Promise<void> => {
  return req.delete(`/back-stage/tags/${id}`).then(() => {})
}
