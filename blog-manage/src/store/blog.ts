import { createSlice, createEntityAdapter, PayloadAction, Update } from "@reduxjs/toolkit"
import { BlogItem } from "@/requests/blog"

type BlogState = ReturnType<typeof blogAdapter.getInitialState>
type BlogStoreBody = BlogItem & {
  id: string | BlogItem["id"] // 用于标记
}



const blogAdapter = createEntityAdapter<BlogItem, BlogItem["id"]>({
  selectId: (item) => item.id
})

const blogStore = createSlice({
  name: "blog",
  initialState: blogAdapter.getInitialState(),
  reducers: {
    addMany: (state, action:  PayloadAction<BlogItem[]>) => {
      blogAdapter.addMany(state, action.payload)
    },
    setAll: (state, action: PayloadAction<BlogItem[]>) => {
      blogAdapter.setAll(state, action.payload)
    },
    
    updateMany: (state, action: PayloadAction<(Pick<BlogItem, "id"> & Partial<BlogItem>)[]>) => {
      const entities = state.entities
      const newEntities = action.payload.map(item => ({ id: item.id, changes: Object.assign({}, entities[item.id], item) }) )
      blogAdapter.updateMany(state, newEntities)
    },
    removeMany: (state, action: PayloadAction<BlogItem["id"][]>) => {
      blogAdapter.removeMany(state, action)
    },
    // moveMany: (state, action: PayloadAction<BlogItem[]>) => {
    // }
  }
})

export const { setAll, addMany, updateMany, removeMany } = blogStore.actions
export default blogStore.reducer