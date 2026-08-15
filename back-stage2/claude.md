目录结构介绍：
```
back‑stage2
├── config/          # 配置文件（数据库、环境变量、服务配置）
├── controllers/     # 控制器，处理业务逻辑的模块
├── middleware/      # 中间件（鉴权、参数校验、日志、异常捕获）
├── models/          # 数据库操作函数，这里只操作数据库并返回数据；
├── routes/          # 路由定义，注册接口路由
├── types/           # TypeScript类型定义、interface、type
├── utils/           # 工具函数、通用辅助方法
├── app.ts           # 项目入口文件
├── package.json
├── tsconfig.json
└── .env
```