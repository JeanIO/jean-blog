import Router from "@koa/router"
import blogRouter from "./blog.js"
import folderRouter from "./folder.js"
import tagRouter from "./tag.js"

const backStageRouter = new Router()

backStageRouter.use("/blogs", blogRouter.routes(), blogRouter.allowedMethods())
backStageRouter.use("/folders", folderRouter.routes(), folderRouter.allowedMethods())
backStageRouter.use("/tags", tagRouter.routes(), tagRouter.allowedMethods())

export default backStageRouter