import Router from "@koa/router"
import { getPublishedTopics, getBlogDetail, getBlogTree, getClientTags, getHotBlogs } from "../../controllers/client.js"

const clientRouter = new Router()

// GET /api/client/blogs 博客列表（已发布博客，含全部详情字段；?tagIds=1,2 标签筛选、?rootOnly=1 只查根博客）
clientRouter.get("/blogs", getPublishedTopics)

// GET /api/client/blogs/hot 热门文章 TOP N（?limit=10，按阅读量倒排）
// 注意：必须注册在 /blogs/:blogId 之前，否则 "hot" 会被当成 blogId 匹配
clientRouter.get("/blogs/hot", getHotBlogs)

// GET /api/client/tags 全量标签列表（筛选器用，公开）
clientRouter.get("/tags", getClientTags)

// GET /api/client/blogs/:blogId 文章详情（打开正文即记一次阅读，Redis INCR）
clientRouter.get("/blogs/:blogId", getBlogDetail)

// GET /api/client/blogTree/:blogId 所属专题树（平铺 { blogs, rootId }，前端自行组树）
clientRouter.get("/blogTree/:blogId", getBlogTree)

export default clientRouter
