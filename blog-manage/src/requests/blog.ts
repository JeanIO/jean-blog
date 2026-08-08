import req, { addResponseParser, ApiResponse } from "./request"

enum BlogAction {
  MOVE = "MOVE",
  PUBLISH = "PUBLISH",
  CONTENT = "CONTENT"
}


export type CreateBlog = {
  id: string
}

export type CreateReqBody = {
  title: string,
  content: string,
  folder_id: number,
  parent_id: number | null,
}


export type BlogItem = Pick<BlogBody, "id" | "title" | "folder_id" | "parent_id" | "is_published" | "create_date" | "update_date">

export type BlogBody = {
  id: number,
  content: string,
  parent_id: number | null,
  title: string,
  folder_id: number,
  is_published: number,
  create_date: string,
  update_date: string,
}

export const createBlog = (blog: CreateReqBody) => {
  const { title = '', content = '', folder_id, parent_id } = blog
  return req.post(`/back-stage/folders/${folder_id}/blogs`, { title, content, parent_id })
}

export const deleteBlog = (blogId: BlogItem["id"]) => {
  return req.delete(`/back-stage/blogs/${blogId}`)
}

export const saveBlog = (blog: Pick<BlogBody, "id" | "title" | "content">) => {
  const { title, content, id } = blog
  return req.patch<BlogBody, ApiResponse<BlogBody>>(`/back-stage/blogs/${id}`, { action: BlogAction.CONTENT, body: { title, content } }).then(res => {
    console.log("更新成功", res)
    return res
  })
}

export const getBlogList = (folder_id: BlogItem["folder_id"]) => {
  return req.get(`/back-stage/folders/${folder_id}/blogs`).then(res => {
    const { data: { list = [] } } = res
    return (list as Array<BlogItem>)
  })
}

export const getBlogContent = (blog_id: BlogItem["id"]) => {
  return req.get<BlogBody, ApiResponse<BlogBody>>(`/back-stage/blogs/${blog_id}`).then(res => {
    return res
  })
}

export const moveBlog = ({ blog_id, folder_id, parent_id }: { blog_id: BlogItem["id"], folder_id: BlogItem["folder_id"], parent_id: BlogItem["parent_id"] | null }) => {
  return req.patch<(Pick<BlogItem, "id"> & Partial<BlogItem>)[]>(`/back-stage/blogs/${blog_id}`, { action: BlogAction.MOVE, body: { folder_id, parent_id } }).then(res => {
    const { data = [] } = res
    return data
  })
}




