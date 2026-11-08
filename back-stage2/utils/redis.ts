import Redis from "ioredis"
import getConfig from "../config/index.js"

// 单例：整个进程共用一个连接
let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    const { host, port } = getConfig().redis
    redis = new Redis({
      host,
      port,
      // 单次请求失败快速抛错，不让接口一直挂着等重连
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 1000, 5000),
    })
    redis.on("error", (err) => {
      console.error(`[redis] 连接错误: ${err.message}`)
    })
  }
  return redis
}

/** 阅读计数的 key 前缀：定时回写任务靠它扫出所有待回写的 key */
export const VIEW_COUNT_PREFIX = "blog:view:"

/** 某篇博客在 Redis 里的计数 key，如 blog:view:12 */
export const getViewCountKey = (blogId: number) => `${VIEW_COUNT_PREFIX}${blogId}`
