import type { Context, Next } from "koa"
import * as folderModel from "../models/folder.js"
import response from "../utils/response.js"

export async function createFolder(ctx: Context, next: Next): Promise<void> {
  const body: any = ctx.request.body || {}
  const { title, desc_info } = body
  try {
    const create_date = new Date()
    const result: any = await folderModel.createFolder({ title, desc_info, create_date })
    console.log("create folder id:", result[0].insertId)
    await next()
    response.created(ctx, { id: result[0].insertId, title, desc_info, create_date })
  } catch (e: any) {
    response.internalError(ctx, "Failed to create folder", e)
  }
}

export async function deleteFolder(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  try {
    await folderModel.deleteFolder({ id: Number(folderId) })
    response.success(ctx, { id: folderId })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to delete folder", e)
  }
}

export async function updateFolder(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  const body2: any = ctx.request.body || {}
  const { title, desc_info } = body2
  try {
    await folderModel.updateFolder({ id: Number(folderId), title, desc_info })
    const folder = await folderModel.getFolderByID({ id: Number(folderId) })
    response.success(ctx, { ...folder })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to update folder", e)
  }
}

export async function getFolderById(ctx: Context, next: Next): Promise<void> {
  const { folderId } = ctx.params
  if (folderId === undefined) {
    response.badRequest(ctx, "folderId is required")
    return
  }
  try {
    const result = await folderModel.getFolderByID({ id: Number(folderId) })
    if (result === undefined) {
      response.notFound(ctx, "folder not found")
      return
    }
    await next()
    response.success(ctx, result)
  } catch (e: any) {
    response.internalError(ctx, "Failed to get this folder", e)
  }
}

export async function getFolderList(ctx: Context, next: Next): Promise<void> {
  try {
    const result = await folderModel.getFolderList()
    response.success(ctx, { list: result ?? [] })
    await next()
  } catch (e: any) {
    response.internalError(ctx, "Failed to get folder list", e)
  }
}