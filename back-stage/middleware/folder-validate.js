import response from '../utils/response.js';
import { getStrCharCount } from '../utils/str.js';

export async function validateInsertFolder(ctx, next) {
  const { title = '', desc_info = '' } = ctx.request.body;
  let title_value = title.trim();
  let desc_info_value = desc_info.trim();
  
  if (!title_value) {
    response.badRequest(ctx, 'title is required');
    return;
  }
  if (getStrCharCount(title_value) > 255) {
    response.badRequest(ctx, 'title is too long');
    return;
  }
  if (getStrCharCount(desc_info_value) > 255) {
    response.badRequest(ctx, 'desc_info is too long');
    return;
  }
  ctx.request.body.title = title_value;
  ctx.request.body.desc_info = desc_info_value;
  await next();
}


export async function validateFolderId(ctx, next) {
  const { folderId } = ctx.params;
  if(folderId === undefined) {
    response.badRequest(ctx, 'folderId is required');
    return;
  }
  if(!/^\d+$/.test(folderId)) {
    response.badRequest(ctx, 'folderId is invalid');
    return;
  }
  ctx.params.folderId = Number(folderId);
  await next();
}
