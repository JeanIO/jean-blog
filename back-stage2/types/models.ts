/** 博客主体（SQL 查询返回的行结构） */
export interface SQLBlog extends BlogBody {
  id: number
  sort_index: number
  create_date: Date
  update_date: Date
}

export interface BlogBody { // 博客信息包体
  title: string
  content?: string
  is_published: number
  folder_id: number
  parent_id: number | null
  path: string,
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
}