import Router from "@koa/router"
import { createTag, getTags, deleteTag } from "../../controllers/tag.js"
import { validateCreateTag, validateTagId } from "../../middleware/tag-validate.js"

const tagRouter = new Router()

// POST /api/back-stage/tags 创建标签
tagRouter.post("/", validateCreateTag, createTag)
// GET /api/back-stage/tags 标签列表（含引用数）
tagRouter.get("/", getTags)
// DELETE /api/back-stage/tags/:tagId 删除标签
tagRouter.delete("/:tagId", validateTagId, deleteTag)

export default tagRouter
