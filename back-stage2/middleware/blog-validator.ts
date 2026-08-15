import type { Context, Next } from "koa"
import { getStrCharCount } from "../utils/str.js"
import response from "../utils/response.js"

export async function validateCreateBlog(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { title = "", content = "" } = body
  if (!title) {
    response.badRequest(ctx, "title and content are required")
    return
  }
  if (getStrCharCount(title) > 250) {
    response.badRequest(ctx, "title length must be less than 250")
    return
  }
  await next()
}

export async function validateBlogId(ctx: Context, next: Next): Promise<void> {
  const { blogId } = ctx.params
  if (blogId === undefined) {
    response.badRequest(ctx, "BlogId is required")
    return
  }
  if (!/^\d+$/.test(blogId)) {
    response.badRequest(ctx, "BlogId is invalid")
    return
  }
  ctx.params.blogId = Number(blogId)
  await next()
}

export async function validateUpdateBlog(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { action } = body
  if (!["CONTENT", "MOVE", "PUBLISH"].includes(action)) {
    response.badRequest(ctx, "action is invalid")
    return
  }
  if (action === "CONTENT") {
    const { title = "" } = body.body || {}
    if (!title) {
      response.badRequest(ctx, "title is required")
      return
    }
  } else if (action === "MOVE") {
    const { parent_id = null, folder_id } = body.body || {}
    if (folder_id === undefined || !/^\d+$/.test(`${folder_id}`)) {
      response.badRequest(ctx, "folder_id is required and must be a number")
      return
    }
    if (parent_id !== null && !/^\d+$/.test(parent_id)) {
      response.badRequest(ctx, "parent_id is invalid")
      return
    }
  } else {
    const { publish_status } = body.body || {}
    if (publish_status === undefined || ![0, 1].includes(publish_status)) {
      response.badRequest(ctx, "publish_status is required and must be 1(PUBLISHED) or 0(UNPUBLISHED)")
      return
    }
  }
  await next()
}