import Router from "@koa/router"
import { validateBlogId, validateUpdateBlog } from "../../middleware/blog-validator.js"
import { getBlogById, updateBlog, deleteBlog } from "../../controllers/blogManage.js"

const blogRouter = new Router()

blogRouter.get("/:blogId", validateBlogId, getBlogById)
blogRouter.patch("/:blogId", validateBlogId, validateUpdateBlog, updateBlog)
blogRouter.delete("/:blogId", validateBlogId, deleteBlog)

export default blogRouter