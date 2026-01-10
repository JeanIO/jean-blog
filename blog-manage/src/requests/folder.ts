import { AxiosResponse } from "axios"
import req from "./request"


export type BlogFolder = {
  id: number,
  title: string,
  desc_info: string
}

export type CreateFolderReqBody = {
  title: string,
  desc_info: string
}

export type FolderList = {
  list: BlogFolder[],
  pagination: any
}
// const createFolder = (folder: BlogFolder) => {
//   const { title = '', descInfo = '' } = folder
//   return req.post('/back-stage/folders', { title, desc_info: descInfo }).then(v => {
//     console.log("创建成功", v)
//     const { id, title, desc_info } = v.data
//     return { id, title, descInfo: desc_info }
//   })
// }
export const createFolder = (folder: CreateFolderReqBody) => {
  const { title = '', descInfo = '' } = folder
  return req.post('/back-stage/folders', { title, desc_info: descInfo }).then(v => {
    const { data: { title, desc_info } } = v
    return { title: title, descInfo: desc_info }
  })
}

export const getFolderList = () => {
  return req.get<void, AxiosResponse<{list: BlogFolder[]}>>('/back-stage/folders').then(v => {
    const { data: { list = [] } } = v 
    return list.map((item) => {
      const { id, title,  desc_info } = item
      return {
        id, title, desc_info
      }
    })
  })
}

// export const getFolderById = (id: string | number) => {
//   return req.get(`/back-stage/folders/${id}`).then(v => {
//     const { data:  } = 
//   })
// }

export const updateFolder = (body: CreateFolderReqBody & { id: BlogFolder["id"] }) => {
  const { id, title, desc_info } = body
  return req.patch<CreateFolderReqBody, AxiosResponse<BlogFolder> >(`/back-stage/folders/${id}`, { title, desc_info }).then(v => {
    const { data: { title, desc_info, id } } = v
    return { title, desc_info, id }
  })
}

export const deleteFolder = (id: BlogFolder["id"]) => {
  return req.delete(`/back-stage/folders/${id}`).then(v => {
    return v.data
  })
}

// export const getFolderList = addResponseParser<void, ApiResponse<FolderList>>(folders => {

// })

