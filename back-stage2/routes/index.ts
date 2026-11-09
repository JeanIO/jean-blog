import Router from "@koa/router"
import clientRouter from "./client/index.js"
import serviceRouter from "./service/index.js"
import backStageRouter from "./back-stage/index.js"
import authRouter from "./back-stage/auth.js"
import authMiddleware from "../middleware/auth.js"
import sqlPool from "../models/sql.js"
import response from "../utils/response.js"
import type { Context, Next } from "koa"

const mainRouter = new Router()

const dbConnectionMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  const status = sqlPool.getStatus()

  if (status !== "connected") {
    console.log("Database not connected, attempting to connect...")

    try {
      await new Promise<void>((resolve, reject) => {
        try {
          sqlPool.init()
          const checkInterval = setInterval(() => {
            const currentStatus = sqlPool.getStatus()
            if (currentStatus === "connected") {
              clearInterval(checkInterval)
              resolve()
            } else if (currentStatus === "error") {
              clearInterval(checkInterval)
              reject(new Error("Database connection error"))
            }
          }, 100)

          setTimeout(() => {
            clearInterval(checkInterval)
            reject(new Error("Database connection timeout"))
          }, 5000)
        } catch (error) {
          reject(error)
        }
      })
      await next()
    } catch (error: any) {
      console.error("Database connection error in middleware:", error)
      response.internalError(ctx, "数据库连接异常，请稍后重试")
    }
  } else {
    await next()
  }
}

// 登录/退出：放在鉴权与 db 中间件之前，不需要登录态也不需要连数据库
mainRouter.use("/api/back-stage", authRouter.routes(), authRouter.allowedMethods())
// 其余 back-stage 接口：先校验 session 登录态，再保证数据库连接
mainRouter.use("/api/back-stage", authMiddleware, dbConnectionMiddleware, backStageRouter.routes(), backStageRouter.allowedMethods())
mainRouter.use("/api/services", serviceRouter.routes(), serviceRouter.allowedMethods())
// 客户端接口公开访问（无需登录），但查询依赖数据库，走 db 中间件做懒连接
mainRouter.use("/api/client", dbConnectionMiddleware, clientRouter.routes(), clientRouter.allowedMethods())

export default mainRouter