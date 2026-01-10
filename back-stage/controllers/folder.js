import * as folderModel from '../models/folder.js';
import response from '../utils/response.js';

export async function createFolder(ctx, next) {
  const { title, desc_info } = ctx.request.body;
  try {
    let create_date = new Date()
    await folderModel.createFolder({ title, desc_info, create_date });
    console.log("create folder id:", result[0].insertId);
    await next();
    response.created(ctx, { id: result[0].insertId, title, desc_info, create_date }); 
  }catch(e) {
    response.internalError(ctx, 'Failed to create folder', e);
    return;
  }
}


export async function deleteFolder(ctx, next) {
  const { folderId } = ctx.params;
  try {
    await folderModel.deleteFolder({ id: folderId });
    response.success(ctx, { id: folderId });
    await next()
  } catch (e) {
    response.internalError(ctx, 'Failed to delete folder', e);
    return;
  }
}

export async function updateFolder(ctx, next) {
  const { id } = ctx.params;
  const { title, desc_info } = ctx.request.body;
  try {
    await folderModel.updateFolder({ id, title, desc_info });
    const folder = await folderModel.getFolderByID({ id });
    response.success(ctx, { ...folder });
    await next()
  } catch (e) {
    response.internalError(ctx, 'Failed to update folder', e);
    return;
  }
}

export async function getFolderById(ctx, next) {
  const { folderId } = ctx.params;
  if(folderId === undefined) {
    response.badRequest(ctx, 'folderId is required');
    return;
  }
  try {
    const result = await folderModel.getFolderByID({ id: folderId });
    // result 格式  undefined || { id, title, desc_info, create_date }
    if(result === undefined) {
      response.notFound(ctx, 'folder not found');
      return;
    }
    await next();
    response.success(ctx, result);
  } catch (e) {
    response.internalError(ctx, 'Failed to get this folder', e);
    return;
  }
}

export async function getFolderList(ctx, next) {
   try {
    const result = await folderModel.getFolderList();

    // const { list = [] } = result // todo 分页
    response.success(ctx, { list: result ?? [] });
    await next()
  } catch (e) {
    response.internalError(ctx, 'Failed to get folder list', e);
    return;
  }
}

