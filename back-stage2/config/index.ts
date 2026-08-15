import path from "path"
import dotenv from "dotenv"
import type { AppConfig } from "../types/models.js"

export default function getConfig(): AppConfig {
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
  }
}