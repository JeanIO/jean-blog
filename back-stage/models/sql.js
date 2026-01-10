import mysql from 'mysql2/promise';

class SqlPool {
  constructor() {
    this.status = "init";
    this.pool = null 
  }

  getStatus() {
    return this.status;
  }

  init() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "database",
      waitForConnections: true,
      connectionLimit: 10,
    });

    return this.pool.getConnection().then((conn) => {
      conn.release();
      console.log("Connected to database");
      this.status = "connected";
    }).catch((err) => {
      console.error("Failed to connect to database", err);
      this.status = "error";
      throw err;
    });
  }

  async query(sql, params) {
    if(this.status !== "connected") {
      console.error("Database not connected");
      throw new Error("Database not connected");
    }
    try {
      return this.pool.execute(sql, params);
    } catch (err) {
      console.error("Failed to query database", err);
      throw err;
    }
  }
}

const sqlPool = new SqlPool();
export default sqlPool;