import type { Context, Next } from "koa"
import * as tagModel from "../models/tag.js"
import response from "../utils/response.js"

/** 创建标签：返回新建的标签（含 id、颜色）；重名返回 409 */
export async function createTag(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { name, color } = body
  try {
    const tag = await tagModel.model_createTag({ name: name.trim(), color })
    response.created(ctx, tag, "创建标签成功")
    await next()
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      response.conflict(ctx, "标签名已存在")
      return
    }
    response.internalError(ctx, "Failed to create tag", e)
  }
}

/** 标签列表（带 blog_count 引用数），供标签选择器和看板"标签分布"使用 */
export async function getTags(ctx: Context, next: Next): Promise<void> {
  try {
    const tags = await tagModel.model_getTags()
    response.success(ctx, { list: tags }, "获取标签列表成功")
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to get tags", e)
  }
}

/** 删除标签：关联关系一并清除（外键级联 + 事务显式删） */
export async function deleteTag(ctx: Context, next: Next): Promise<void> {
  const { tagId } = ctx.params
  try {
    const [exists] = await tagModel.model_getTagByIds([Number(tagId)])
    if (!exists) {
      response.notFound(ctx, "标签不存在")
      return
    }
    await tagModel.model_deleteTag(Number(tagId))
    response.success(ctx, { id: Number(tagId) }, "删除标签成功")
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to delete tag", e)
  }
}
