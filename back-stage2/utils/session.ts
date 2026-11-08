import crypto from "node:crypto"
import getConfig from "../config/index.js"

/** 服务端 session：只把随机 sessionId 下发给浏览器，用户信息留在服务端 */
export interface Session {
  id: string
  username: string
  /** 过期时间戳（毫秒） */
  expiresAt: number
}

const config = getConfig()

/** 内存 session 表：服务重启后全部失效（生产可换成 Redis 等外部存储） */
const sessions = new Map<string, Session>()

// 定时清扫过期 session，避免内存泄漏
const sweepTimer = setInterval(() => {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id)
    }
  }
}, 600 * 60 * 1000)
sweepTimer.unref?.()

/** 创建 session（登录成功时调用） */
export const createSession = (username: string): Session => {
  const session: Session = {
    id: crypto.randomUUID(),
    username,
    expiresAt: Date.now() + config.session.maxAge,
  }
  sessions.set(session.id, session)
  return session
}

/** 读取 session（惰性过期：读取时校验，过期即销毁） */
export const getSession = (id: string | undefined): Session | null => {
  if (!id) return null
  const session = sessions.get(id)
  if (!session) return null

  if (session.expiresAt <= Date.now()) {
    sessions.delete(id)
    return null
  }
  return session
}

/** 销毁 session（退出登录时调用） */
export const destroySession = (id: string | undefined): void => {
  if (id) sessions.delete(id)
}
