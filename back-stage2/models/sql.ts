import mysql from "mysql2/promise"

type PoolStatus = "init" | "connected" | "error"

class SqlPool {
  status: PoolStatus = "init"
  pool: mysql.Pool | null = null

  getStatus(): PoolStatus {
    return this.status
  }

  init(): Promise<void> {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "database",
      waitForConnections: true,
      connectionLimit: 10,
    })

    return this.pool.getConnection().then((conn) => {
      conn.release()
      console.log("Connected to database")
      this.status = "connected"
    }).catch((err) => {
      console.error("Failed to connect to database", err)
      this.status = "error"
      throw err
    })
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (this.status !== "connected") {
      console.error("Database not connected")
      throw new Error("Database not connected")
    }
    try {
      return this.pool!.execute(sql, params)
    } catch (err) {
      console.error("Failed to query database", err)
      throw err
    }
  }

  /**
   * 事务包装：fn 内用 query 执行语句，全部成功才提交，任一失败自动回滚。
   * 多语句必须原子时使用（如标签的"先删后插"，避免删成功插失败留下中间状态）。
   * 事务绑定在单个连接上，连接池的 query 每次可能换连接，所以这里固定 getConnection。
   */
  async transaction<T>(fn: (query: (sql: string, params?: any[]) => Promise<any>) => Promise<T>): Promise<T> {
    if (this.status !== "connected" || !this.pool) {
      throw new Error("Database not connected")
    }
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      const result = await fn((sql, params) => conn.execute(sql, params))
      await conn.commit()
      return result
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }
}

const sqlPool = new SqlPool()
export default sqlPool