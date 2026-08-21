
import { Button, message } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { createBlog, getBlogContent, saveBlog } from "@/requests/blog"
import { useAppDispatch, useAppSelector } from "@/store"
import { updateMany } from "@/store/blog"
import { useParams, useOutletContext } from "umi"
import RichText from "@/components/RichText"

import "./EditManage.less"


export default function EditManager() {
  const [saveLoading, setSaveLoading] = useState(false)
  // @ts-ignore
  const { leftSpaceRef, rightSpaceRef } = useOutletContext()
  const richText = useRef<any>(null) // 保存editor实例Ref
  const dispatch = useAppDispatch()
  const { blogId } = useParams()
  const [docContent, setDocContent] = useState<{ title: string, content: string }>({ title: '', content: '' })
  const [mode, setMode] = useState<'edit' | 'view'>('view')
  const blogInfo = useAppSelector(state => {
    return state.blog.entities[Number(blogId)] || {}
  })
  useEffect(() => {
    if (blogId === undefined) {
      message.error("请选择博客")
      return
    }
    setMode('view')
    getBlogContent(Number(blogId)).then(v => {
      const { data: { content, title } } = v
      setDocContent({ content, title })
    })
  }, [blogId])
  const onSubmit = useCallback(() => {
    const { title, content } = richText.current?.getInfo() || {}
    if(blogId === undefined) return
    setSaveLoading(true)
    saveBlog({ title, content, id: Number(blogId) }).then((res) => {
      message.success("保存成功")
      const { content: _, ...rest } = res.data || {}
      setDocContent({ title, content })
      dispatch(updateMany([{ ...rest, id: Number(blogId), title }]))
    }).finally(() => {
      setMode('view')
      setSaveLoading(false)
    })
  }, [blogId])
  // 自动保存方法（由 RichText 触发）：执行真实保存并同步 store；失败向上抛出由 RichText 处理状态
  const onAutoSave = useCallback(async (title: string, content: string) => {
    if (blogId === undefined) return
    const res = await saveBlog({ title, content, id: Number(blogId) })
    const { content: _, ...rest } = res.data || {}
    setDocContent({ title, content })
    dispatch(updateMany([{ ...rest, id: Number(blogId), title }]))
  }, [blogId, dispatch])
  const onToggleMode = useCallback((value: 'edit' | 'view') => {
    setMode(value)
  }, [mode])
  // if(leftSpaceRef.current == null || ) return "waiting"
  return <div className="component-content-container edit-mamager-container">
    <RichText
    mode={mode}
    ref={richText}
    docContent={docContent}
    onAutoSave={onAutoSave}
    autoSaveDelay={15000}
    />
    {rightSpaceRef.current == null ? null :
      createPortal(
        mode === 'view' ? <Button type="primary" onClick={() => onToggleMode("edit")}>编辑</Button> :
          <div className="operations-wrapper">
            <Button onClick={() => onToggleMode("view")}>取消</Button>
            <Button loading={saveLoading} type="primary" onClick={onSubmit}>保存</Button>
          </div>, rightSpaceRef.current)
    }

  </div>
}
