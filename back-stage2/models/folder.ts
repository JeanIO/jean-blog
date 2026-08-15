import sqlPool from "./sql.js"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "../types/models.js"
import type { RowDataPacket } from "mysql2"

export function getFolderByID({ id }: { id: number }): Promise<Folder | undefined> {
  return sqlPool.query("SELECT id, title, desc_info, create_date FROM blog_folder WHERE id = ? AND is_deleted = 0", [id])
    .then(([rows]: [RowDataPacket[], any]) => {
      return rows[0] as Folder | undefined
    })
}

export function getFolderList(): Promise<Folder[]> {
  return sqlPool.query("SELECT id, title, desc_info, create_date FROM blog_folder WHERE is_deleted = 0")
    .then(([rows]: [RowDataPacket[], any]) => rows as Folder[])
}

export function createFolder({ title, desc_info, create_date = new Date() }: CreateFolderInput): Promise<any> {
  return sqlPool.query("INSERT INTO blog_folder (title, desc_info, create_date) VALUES (?, ?, ?)", [title, desc_info, create_date])
}

export function deleteFolder({ id }: { id: number }): Promise<any> {
  return sqlPool.query("UPDATE blog_folder SET is_deleted = 1 WHERE id = ?", [id])
}

export function updateFolder({ id, title, desc_info }: UpdateFolderInput): Promise<any> {
  return sqlPool.query("UPDATE blog_folder SET title = ?, desc_info = ? WHERE id = ?", [title, desc_info, id])
}