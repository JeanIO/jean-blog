import { createFolder, deleteFolder, updateFolder, getFolderList, getFolderById } from "../../controllers/folder.js"
import { getBlogsByFolderId, createBlog } from "../../controllers/blogManage.js"
import { validateInsertFolder, validateFolderId } from "../../middleware/folder-validate.js"
import { validateCreateBlog, validateBlogId } from "../../middleware/blog-validator.js"
import Router from "@koa/router"

const folderRouter = new Router()

folderRouter.post("/", validateInsertFolder, createFolder)
folderRouter.get("/", getFolderList)
folderRouter.get("/:folderId", validateFolderId, getFolderById)
folderRouter.patch("/:folderId", validateFolderId, validateInsertFolder, updateFolder)
folderRouter.delete("/:folderId", validateFolderId, deleteFolder)
folderRouter.get("/:folderId/blogs", validateFolderId, getBlogsByFolderId)
folderRouter.post("/:folderId/blogs", validateFolderId, validateCreateBlog, createBlog)

export default folderRouter