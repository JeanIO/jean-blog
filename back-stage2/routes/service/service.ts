import Router from "@koa/router"
import { getOSSAuthrization, getFileCosKey } from "../../controllers/service.js"

const serviceRouter = new Router()

serviceRouter.get("/getCOSAuthrization", getOSSAuthrization)
serviceRouter.get("/getCOSKey", getFileCosKey)

export default serviceRouter