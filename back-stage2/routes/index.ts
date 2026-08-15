import Router from "@koa/router"
import clientRouter from "./client/index.js"
import serviceRouter from "./service/index.js"
import backStageRouter from "./back-stage/index.js"
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

mainRouter.use("/api/back-stage", dbConnectionMiddleware, backStageRouter.routes(), backStageRouter.allowedMethods())
mainRouter.use("/api/services", serviceRouter.routes(), serviceRouter.allowedMethods())
mainRouter.use("/api/client", clientRouter.routes(), clientRouter.allowedMethods())

export default mainRouter