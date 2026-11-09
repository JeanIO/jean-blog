import type { Context, Next } from "koa"
import { getStrCharCount } from "../utils/str.js"
import response from "../utils/response.js"

/** 校验创建标签入参：name 必填、最长 20 字（UI 标签也显示不下更长的）；color 必须是 #RRGGBB 十六进制 */
export async function validateCreateTag(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { name = "", color = "" } = body
  if (!name || !name.trim()) {
    response.badRequest(ctx, "name is required")
    return
  }
  if (getStrCharCount(name) > 20) {
    response.badRequest(ctx, "name length must be less than 20")
    return
  }
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    response.badRequest(ctx, "color must be a hex color like #1890ff")
    return
  }
  await next()
}

export async function validateTagId(ctx: Context, next: Next): Promise<void> {
  const { tagId } = ctx.params
  if (!/^\d+$/.test(tagId)) {
    response.badRequest(ctx, "tagId is invalid")
    return
  }
  ctx.params.tagId = Number(tagId)
  await next()
}
