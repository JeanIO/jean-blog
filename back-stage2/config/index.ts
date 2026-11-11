import path from "path"
import dotenv from "dotenv"
import type { AppConfig } from "../types/models.js"

export default function getConfig(): AppConfig {
  // 相对代码文件定位 .env（服务器只部署 dist，不部署源码）：
  // dev: src/config → ../.env = 项目根/.env
  // 生产: dist/config → ../.env = dist/.env（由 build 脚本在编译后拷入 dist）
  dotenv.config({ path: path.resolve(import.meta.dirname!, "../.env") })

  return {
    server: {
      port: Number(process.env.PORT) || 3000,
      host: process.env.HOST || "localhost",
    },
    database: {
      type: process.env.DB_TYPE || "mock",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      name: process.env.DB_NAME || "myapp",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    },
    logger: {
      level: process.env.LOG_LEVEL || "info",
      file: process.env.LOG_FILE || "app.log",
    },
    security: {
      secretKey: process.env.SECRET_KEY || "mysecretkey12345",
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
    // 登录账号密码先写死在后台（可用 .env 覆盖）
    auth: {
      username: process.env.AUTH_USERNAME || "admin",
      password: process.env.AUTH_PASSWORD || "admin123",
    },
    // session 配置：有效期（毫秒）
    session: {
      maxAge: Number(process.env.SESSION_MAX_AGE) || 3600 * 1000,
    },
    // redis 配置：阅读计数等实时计数场景（可用 .env 覆盖）
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
}