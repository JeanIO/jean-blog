# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

个人博客 monorepo,4 个互相独立的 npm 包(**没有 workspace 工具,各包在自己的目录里跑 npm 命令**):

| 目录 | 用途 | 技术栈 |
|---|---|---|
| [back-stage2](back-stage2/) | 后端 API 服务 | Koa 3 + TypeScript(ESM)+ MySQL + Redis |
| [blog-manage](blog-manage/) | 管理后台(写博客) | Umi 4 + React 18 + antd 4 + Redux Toolkit |
| [blog-client](blog-client/) | 博客前台(读者看) | Vue 3 + Vite 8 + Element Plus |
| [webhook-server](webhook-server/) | 生产环境 GitHub 自动部署 | Koa(纯 JS,只跑在服务器上) |

前端两个包 dev 时都把 `/api` 代理到 `http://localhost:3000`(后端默认端口,可用 `PORT` 环境变量改)。整个仓库没有任何测试(`npm test` 都是占位报错)。

## 常用命令

```sh
# 后端(back-stage2):需要本地 MySQL + Redis,配置在 .env(gitignored,启动前要有)
cd back-stage2 && npm run dev        # 开发:nodemon + tsx 热重启,带 --inspect
cd back-stage2 && npm run start      # NODE_ENV=production,tsx watch
cd back-stage2 && npm run build      # tsc 编译到 dist/ 并拷贝 .env
cd back-stage2 && npm run devCheck   # tsc --noEmit --watch 类型检查

# 管理后台(blog-manage):要求 Node 18(README 与部署脚本都明确写了)
cd blog-manage && npm run dev        # umi dev
cd blog-manage && npm run build      # umi build

# 博客前台(blog-client):engines 要求 Node ^22.18 或 >=24.12
cd blog-client && npm run dev        # vite dev(监听 IPv4 回环,配合 /etc/hosts 域名如 john-blog.top)
cd blog-client && npm run build      # vue-tsc 类型检查 + vite build
cd blog-client && npm run type-check # 单独跑类型检查

# webhook-server:仅生产服务器运行,本地开发不涉及
cd webhook-server && node index.js   # 监听 9000 端口
```

## 架构要点

### 后端分层(back-stage2)

按 [back-stage2/claude.md](back-stage2/claude.md) 的分层:routes(注册路由)→ middleware(鉴权/参数校验)→ controllers(业务)→ models(只写 SQL 并返回数据,`models/sql.ts` 提供连接池和事务包装)。关键机制:

- **统一响应信封**:所有接口返回 `{ id, code, message, data }`(`utils/response.ts`),前端 axios 拦截器都按这个结构解包,改接口格式要同步两个前端。
- **鉴权**:登录账号默认硬编码 `admin/admin123`(`config/index.ts`,可被 .env 覆盖);服务端内存 session(重启全部失效),sessionId 放 httpOnly cookie `blog_session`,`middleware/auth.ts` 校验后挂到 `ctx.state.session`。接口前缀三组:`/api/back-stage`(登录+鉴权+DB)、`/api/client`(公开,只过 DB 懒连接中间件)、`/api/services`(COS 上传凭证,公开)。
- **数据库懒连接**:`routes/index.ts` 的中间件在首次请求时才 init 连接池。
- **阅读计数**:GET `/api/client/blogs/:blogId` 时 Redis `INCR`,每 5s 由 `utils/viewCountJob.ts` 用 `GETDEL` 原子取走增量回写 MySQL `view_times`;回写失败把计数还回 Redis 下轮重试。
- **COS 图片上传**:前端拿临时密钥走腾讯云 COS 直传,凭证来自 `/api/services/getCOSAuthrization` 和 `/api/services/getCOSKey`。

### 博客数据模型

- 博客有 `parent_id`(专题树层级)、`prev_id`/`sort_index`(排序)、`tag_ids`(创建/更新接口**必传,空数组=清空标签**)。
- 正文 `content` 存的是语雀 lake 格式(`text/lake`),不是 Markdown/HTML。
- PATCH 更新用 `action` 区分:`CONTENT` / `MOVE` / `PUBLISH`(`middleware/blog-validator.ts` 校验)。

### 语雀 lake 编辑器/渲染器(核心依赖)

前后台共用语雀开源 lake 引擎,通过 **UMD 脚本全局加载,不打包进 bundle**,版本锁定 **1.67.0**:

- 版本引用有 3 处,改引擎版本必须同步改:[blog-client/index.html](blog-client/index.html)、[blog-manage/plugins/htmlConvert.ts](blog-manage/plugins/htmlConvert.ts)、[blog-manage/src/components/RichText/yuque.json](blog-manage/src/components/RichText/yuque.json)。blog-client/.env 里的 `YUQUE_VERSION` 已没有任何代码引用,是废弃配置。
- 前台 [BlogDetail/RichText.vue](blog-client/src/pages/BlogDetail/RichText.vue) 用 `window.Doc.createOpenViewer` 渲染。
- 后台 [RichText/index.tsx](blog-manage/src/components/RichText/index.tsx) 用 lake 编辑器 + 自动保存(默认 3s 防抖,`onAutoSave` 由 EditManager 提供)。近期三个提交都在修自动保存导致滚动条漂移的问题,改动编辑器渲染/保存逻辑时要小心这块。

### 前端请求层约定

两个前端的 [request.ts](blog-client/src/requests/request.ts) 同构:axios 单例 baseURL `/api`,响应拦截器返回后端信封,错误按状态码提示。blog-manage 额外处理 401:清 localStorage 登录标记并跳 `/login?url=...`(登录标记只是前端路由判断用,真登录态在后端 session)。blog-manage 的请求封装用 `addResponseParser` 把信封解包成 `Promise<data>`。

### 管理后台(blog-manage)特有

- React/ReactDOM 是 **externals**(从 unpkg UMD 加载,不打进 bundle),`.umirc.ts` 里配置;路由定义在 [src/pages/routes.ts](blog-manage/src/pages/routes.ts)(umi 约定式路由的配置化写法,带 layout/noMenu 标记)。
- 目录树用 react-arborist + 自定义 CatalogueTree 组件,状态在 Redux(`src/store/folder.ts`、`blog.ts`)。

### 生产部署链路(webhook-server,平时不碰)

GitHub push main → 服务器 webhook-server(9000)验签 `X-Hub-Signature-256` → `bash deploy.sh`:git pull → 依次 build blog-client(默认 Node)→ blog-manage(**nvm use 18**)→ back-stage2 → `pm2 reload jean-blog`。路径硬编码 `/home/ubuntu/jean-blog`,改部署脚本注意这些版本约束。

## 工作方式

- 数据模型、字段设计、接口格式这类方案性变更,先和用户讨论对齐再动手实现。
- 代码注释和文档以中文为主,保持与现有代码一致。
