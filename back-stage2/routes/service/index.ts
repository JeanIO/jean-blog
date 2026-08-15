import serviceRouter from "./service.js"
import Router from "@koa/router"

const sRouter = new Router()

sRouter.use(serviceRouter.routes(), serviceRouter.allowedMethods())

export default sRouter