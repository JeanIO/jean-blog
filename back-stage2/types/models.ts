/** 博客主体（SQL 查询返回的行结构） */
export interface SQLBlog extends BlogBody {
  id: number
  sort_index: number
  create_date: Date
  update_date: Date
  /** 阅读次数（DB: int unsigned，默认 0；增长逻辑由 client 相关接口维护） */
  view_times: number
}

export interface BlogBody { // 博客信息包体
  title: string
  content?: string
  is_published: number
  folder_id: number
  parent_id: number | null
  path: string,
  /** 博客背景图 URL（DB: char(255)，可空） */
  /** 博客简介：插入/更新时从 content 的 <blockquote> 截取（DB: varchar(1000)，可空） */
  desc_info?: string | null
}



/** 更新博客入参（批量字段） */
export interface BatchUpdateBlogItem {
  id: number
  parent_id?: number | null
  path?: string
  update_date?: Date
  is_published?: number,
  sort_index?: number,
  folder_id: number
}

/** 博客查询过滤器 */
export interface BlogFilter {
  blogId?: number
  parentId?: number | null
  folderId?: number
  title?: string
  content?: string
}

/** 文件夹 */
export interface Folder {
  id: number
  title: string
  desc_info: string
  create_date: Date
}

/** 文件夹创建入参 */
export interface CreateFolderInput {
  title: string
  desc_info?: string
  create_date?: Date
}

/** 文件夹更新入参 */
export interface UpdateFolderInput {
  id: number
  title?: string
  desc_info?: string
}

/** 标签（blog_tag 表；blog_count 为查询接口聚合出的被引用次数，可选） */
export interface Tag {
  id: number
  name: string
  color: string
  create_date: Date
  /** 被多少篇博客引用（GET 标签列表时聚合返回） */
  blog_count?: number
}

/** 标签创建入参 */
export interface CreateTagInput {
  name: string
  color?: string
}

/** 标签简要信息（C 端展示用：内嵌进博客响应，不做客户端关联） */
export interface TagBrief {
  id: number
  name: string
  color: string
}

/** 用户 */
export interface User {
  id: number
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

/** 用户创建入参 */
export interface CreateUserInput {
  name: string
  email: string
  [key: string]: any
}

/** 应用配置 */
export interface AppConfig {
  server: {
    port: number
    host: string
  }
  database: {
    type: string
    host: string
    port: number
    name: string
    user: string
    password: string
  }
  logger: {
    level: string
    file: string
  }
  security: {
    secretKey: string
    jwtExpiresIn: string
  }
  /** 登录凭证：暂为后台写死的账号密码 */
  auth: {
    username: string
    password: string
  }
  /** session 配置 */
  session: {
    maxAge: number
  }
  /** redis 配置（阅读计数等实时计数场景） */
  redis: {
    host: string
    port: number
  }
}