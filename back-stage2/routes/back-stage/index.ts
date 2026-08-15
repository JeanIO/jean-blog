import Router from "@koa/router"
import blogRouter from "./blog.js"
import folderRouter from "./folder.js"

const backStageRouter = new Router()

backStageRouter.use("/blogs", blogRouter.routes(), blogRouter.allowedMethods())
backStageRouter.use("/folders", folderRouter.routes(), folderRouter.allowedMethods())

export default backStageRouter