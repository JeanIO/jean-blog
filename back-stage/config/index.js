// 应用配置文件
import path from 'path';
import dotenv from 'dotenv';

// 导出配置函数，支持运行时动态生成配置
export default () => {
  // 只加载基础配置文件

  dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') });

  return {
    // 服务器配置
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    },
    
    // 数据库配置
    database: {
      type: process.env.DB_TYPE || 'mock', // 可以扩展为mysql, mongodb等
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      name: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    },
    
    // 日志配置
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE || 'app.log'
    },
    
    // 安全配置
    security: {
      secretKey: process.env.SECRET_KEY || 'mysecretkey12345',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  };
}