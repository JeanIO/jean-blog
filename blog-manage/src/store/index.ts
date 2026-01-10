import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook, useDispatch } from "react-redux"
import folderStore from "./folder"
const reducer = combineReducers({
    folder: folderStore
})
const store = configureStore({
  reducer
})
export type AppDispatch = typeof store.dispatch


export type RootType = ReturnType<typeof reducer>;
export const useAppSelector: TypedUseSelectorHook<RootType> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export default store