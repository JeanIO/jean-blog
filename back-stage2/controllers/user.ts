import type { Context } from "koa"
import UserModel from "../models/user.js"
import response from "../utils/response.js"

export async function getUsers(ctx: Context): Promise<void> {
  try {
    const users = UserModel.getAll()
    response.success(ctx, users, "Users retrieved successfully")
  } catch (error: any) {
    response.internalError(ctx, "Failed to retrieve users", error)
  }
}

export async function getUserById(ctx: Context): Promise<void> {
  try {
    const { id } = ctx.params
    const user = UserModel.getById(id)
    if (user) {
      response.success(ctx, user, "User retrieved successfully")
    } else {
      response.notFound(ctx, "User not found")
    }
  } catch (error: any) {
    response.internalError(ctx, "Failed to retrieve user", error)
  }
}

export async function createUser(ctx: Context): Promise<void> {
  try {
    const userData: any = ctx.request.body
    const user = UserModel.create(userData)
    response.created(ctx, user, "User created successfully")
  } catch (error: any) {
    response.badRequest(ctx, "Failed to create user", error)
  }
}

export async function updateUser(ctx: Context): Promise<void> {
  try {
    const { id } = ctx.params
    const userData: any = ctx.request.body || {}
    const user = UserModel.update(id, userData)
    if (user) {
      response.success(ctx, user, "User updated successfully")
    } else {
      response.notFound(ctx, "User not found")
    }
  } catch (error: any) {
    response.badRequest(ctx, "Failed to update user", error)
  }
}

export async function deleteUser(ctx: Context): Promise<void> {
  try {
    const { id } = ctx.params
    const success = UserModel.delete(id)
    if (success) {
      response.success(ctx, null, "User deleted successfully")
    } else {
      response.notFound(ctx, "User not found")
    }
  } catch (error: any) {
    response.internalError(ctx, "Failed to delete user", error)
  }
}