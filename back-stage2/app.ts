import Koa from "koa"
import bodyParser from "koa-bodyparser"
import koaStatic from "koa-static"
import path from "path"
import getConfig from "./config/index.js"
import mainRouter from "./routes/index.js"

const config = getConfig()

const app = new Koa()

app.use(bodyParser())
app.use(koaStatic(path.join(import.meta.dirname!, "public")))

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error: any) {
    ctx.status = error.status || 500
    ctx.body = {
      code: error.status || 500,
      message: error.message || "Internal Server Error",
      error: error.stack,
    }
  }
})

app.use(mainRouter.routes())

app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`)
  console.log(`API documentation: http://localhost:${config.server.port}/api/docs`)
})

export default app