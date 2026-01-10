
import { Input, Button, message, Menu } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import { createBlog } from "@/requests/blog"
import RichText from "@/components/RichText"

import "./EditManage.less"


export default function EditManager() {
  const [saveLoading, setSaveLoading] = useState(false)
  const richText = useRef<any>(null) // 保存editor实例Ref
  
  const onSubmit = useCallback(() => {
    console.log(richText.current?.getInfo())
    const { title, content } = richText.current?.getInfo() || {}
    setSaveLoading(true)
    createBlog({ title, content }).then((res) => {
      console.log("保存成功", res)
      message.success("保存成功")
    }).finally(() => {
      setSaveLoading(false)
    })
  }, [])

  useEffect(() => {
    // createFolder({ title: "sdsd", descInfo:"ccccccsdsd" })
  }, [])

  return <div className="component-content-container edit-mamager-container">
    <RichText mode="edit" ref={richText} />
    <div className="save-btn-wrapper">
      <Button>保存草稿</Button>
      <Button loading={saveLoading} type="primary" onClick={onSubmit}>创建</Button>
    </div>
  </div>
}
