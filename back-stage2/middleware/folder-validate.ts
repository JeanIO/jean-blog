import type { Context, Next } from "koa"
import response from "../utils/response.js"
import { getStrCharCount } from "../utils/str.js"

export async function validateInsertFolder(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { title = "", desc_info = "" } = body
  const title_value = title.trim()
  const desc_info_value = desc_info.trim()
  console.log(ctx)
  if (!title_value) {
    response.badRequest(ctx, "title is required")
    return
  }
  if (getStrCharCount(title_value) > 255) {
    response.badRequest(ctx, "title is too long")
    return
  }
  if (getStrCharCount(desc_info_value) > 255) {
    response.badRequest(ctx, "desc_info is too long")
    return
  }
  body.title = title_value
  body.desc_info = desc_info_value
  await next()
}

export async function validateFolderId(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  if (folderId === undefined) {
    response.badRequest(ctx, "folderId is required")
    return
  }
  if (!/^\d+$/.test(folderId)) {
    response.badRequest(ctx, "folderId is invalid")
    return
  }
  ctx.params.folderId = Number(folderId)
  await next()
}