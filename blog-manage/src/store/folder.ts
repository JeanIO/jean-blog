import { createSlice, createEntityAdapter, PayloadAction, Update } from "@reduxjs/toolkit"

export type Folder = {
  id: number,
  title: string, 
  desc_info: string
}

const folderAdapter = createEntityAdapter<Folder, Folder["id"]>({
  selectId: (item) => item.id
})

const folderStore = createSlice({
  name: "folder",
  initialState: folderAdapter.getInitialState(),
  reducers: {
    addMany: (state, action:  PayloadAction<Folder>) => {
      folderAdapter.addMany(state, action.payload)
    },
    setAll: (state, action: PayloadAction<Folder[]>) => {
      folderAdapter.setAll(state, action.payload)
    },
    updateMany: (state, action: PayloadAction<Folder[]>) => {
      const entities = action.payload.map(item => ({ id: item.id, changes: item }) )
      folderAdapter.updateMany(state, entities)
    },
    removeMany: (state, action: PayloadAction<Folder["id"][]>) => {
      folderAdapter.removeMany(state, action)
    }
  }
})

export const { setAll, addMany, updateMany, removeMany } = folderStore.actions
export default folderStore.reducer