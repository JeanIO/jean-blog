import req, { addResponseParser, ApiResponse } from "./request"

export type CreateBlog = {
  id: string
}

export type CreateReqBody = {
  title: string,
  content: string
}

export const createBlog = addResponseParser<CreateReqBody, ApiResponse<CreateBlog>>((blog) => {
  const { title = '', content = '' } = blog
  return req.post('/back-stage/blog/tree', { title, content })
})

export const getBlogs = (folderId: number) => {
  return req.get('/back-stage/blog/tree')
}