// 用户数据模型
import User from '../models/user.js';
import response from '../utils/response.js';

// 获取所有用户
const getUsers = async (ctx) => {
  try {
    const users = User.getAll();
    response.success(ctx, users, 'Users retrieved successfully');
  } catch (error) {
    response.internalError(ctx, 'Failed to retrieve users', error);
  }
};

// 根据ID获取用户
const getUserById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const user = User.getById(id);
    if (user) {
      response.success(ctx, user, 'User retrieved successfully');
    } else {
      response.notFound(ctx, 'User not found');
    }
  } catch (error) {
    response.internalError(ctx, 'Failed to retrieve user', error);
  }
};

// 创建用户
const createUser = async (ctx) => {
  try {
    const userData = ctx.request.body;
    const user = User.create(userData);
    response.created(ctx, user, 'User created successfully');
  } catch (error) {
    response.badRequest(ctx, 'Failed to create user', error);
  }
};

// 更新用户
const updateUser = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userData = ctx.request.body;
    const user = User.update(id, userData);
    if (user) {
      response.success(ctx, user, 'User updated successfully');
    } else {
      response.notFound(ctx, 'User not found');
    }
  } catch (error) {
    response.badRequest(ctx, 'Failed to update user', error);
  }
};

// 删除用户
const deleteUser = async (ctx) => {
  try {
    const { id } = ctx.params;
    const success = User.delete(id);
    if (success) {
      response.success(ctx, null, 'User deleted successfully');
    } else {
      response.notFound(ctx, 'User not found');
    }
  } catch (error) {
    response.internalError(ctx, 'Failed to delete user', error);
  }
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};