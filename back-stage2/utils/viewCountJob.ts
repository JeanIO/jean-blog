import { getRedis, VIEW_COUNT_PREFIX } from "./redis.js"
import { model_addViewTimes } from "../models/blogManage.js"

/** 回写间隔：5s，练习用，方便观察"先涨 Redis、后落 MySQL"的过程 */
const FLUSH_INTERVAL = 5000

/**
 * 定时回写任务：把 Redis 里的阅读计数增量批量刷回 MySQL 的 view_times 列
 *
 * 一致性设计（write-back）：
 * - 用 GETDEL 原子地"取出并删除"每个 key，再累加到 MySQL；
 * - 期间新进来的 INCR 会重新创建 key，留给下一轮，不会丢；
 * - MySQL 写失败时用 INCRBY 把计数还回 Redis，下轮重试。
 */
export function startViewCountFlushJob(): void {
  const redis = getRedis()
  let flushing = false // 防止上一轮没跑完下一轮又进来

  const flushOnce = async () => {
    if (flushing || redis.status !== "ready") return
    flushing = true
    try {
      // keys 对练习规模足够；生产环境应改用 SCAN 避免阻塞 Redis
      const keys = await redis.keys(`${VIEW_COUNT_PREFIX}*`)
      for (const key of keys) {
        const blogId = Number(key.slice(VIEW_COUNT_PREFIX.length))
        if (!Number.isFinite(blogId)) continue

        const count = await redis.getdel(key)
        if (!count || Number(count) <= 0) continue

        try {
          await model_addViewTimes(blogId, Number(count))
        } catch (e) {
          // 回写 MySQL 失败：把计数还回 Redis，下轮重试，避免丢数据
          console.error(`[viewCount] 回写 blog ${blogId} 失败，计数 ${count} 退回 Redis`, e)
          await redis.incrby(key, Number(count))
        }
      }
    } catch (e) {
      console.error("[viewCount] 回写任务出错", e)
    } finally {
      flushing = false
    }
  }

  setInterval(flushOnce, FLUSH_INTERVAL)
  console.log(`[viewCount] 回写任务已启动，每 ${FLUSH_INTERVAL / 1000}s 执行一次`)
}
