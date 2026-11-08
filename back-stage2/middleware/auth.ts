import type { Context, Next } from "koa"
import { getSession } from "../utils/session.js"
import response from "../utils/response.js"

const SESSION_COOKIE = "blog_session"

/** session 鉴权中间件：校验 cookie 里的 sessionId，通过后把 session 挂到 ctx.state.session */
export default async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const session = getSession(ctx.cookies.get(SESSION_COOKIE))
  if (!session) {
    response.unauthorized(ctx, "登录已过期")
    return
  }

  ctx.state.session = session
  await next()
}
