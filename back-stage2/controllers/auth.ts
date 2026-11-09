import type { Context } from "koa"
import getConfig from "../config/index.js"
import { createSession, destroySession } from "../utils/session.js"
import response from "../utils/response.js"

const SESSION_COOKIE = "blog_session"

/** 登录：校验后台写死的账号密码，成功后创建 session 并通过 Set-Cookie 下发 sessionId */
export async function login(ctx: Context): Promise<void> {
  try {
    const { username, password } = (ctx.request.body || {}) as { username?: string; password?: string }
    const { auth, session } = getConfig()

    if (!username || !password) {
      response.badRequest(ctx, "用户名和密码不能为空")
      return
    }

    if (username !== auth.username || password !== auth.password) {
      response.unauthorized(ctx, "用户名或密码错误")
      return
    }

    const newSession = createSession(username)
    ctx.cookies.set(SESSION_COOKIE, newSession.id, {
      httpOnly: true,          // JS 读不到，防 XSS 窃取
      sameSite: "lax",         // 防 CSRF
      maxAge: session.maxAge,  // 单位毫秒，与 session 有效期一致
      path: "/",
    })

    response.success(ctx, { username }, "登录成功")
  } catch (error: any) {
    response.internalError(ctx, "登录失败", error)
  }
}

/** 退出登录：销毁服务端 session 并清除浏览器 cookie */
export async function logout(ctx: Context): Promise<void> {
  try {
    destroySession(ctx.cookies.get(SESSION_COOKIE))
    ctx.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" })
    response.success(ctx, null, "已退出登录")
  } catch (error: any) {
    response.internalError(ctx, "退出登录失败", error)
  }
}
