import Router from "@koa/router"
import { validateBlogId, validateUpdateBlog } from "../../middleware/blog-validator.js"
import { getBlogById, updateBlog } from "../../controllers/blogManage.js"

const blogRouter = new Router()

blogRouter.get("/:blogId", validateBlogId, getBlogById)
blogRouter.patch("/:blogId", validateBlogId, validateUpdateBlog, updateBlog)

export default blogRouter