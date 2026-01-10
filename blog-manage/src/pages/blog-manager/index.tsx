
import { Input, Button, message, Layout, SiderProps } from "antd"
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { Outlet } from "umi"
import { useCallback, useEffect, useRef, useState } from "react"
import RichText from "@/components/RichText"
import { createBlog } from "@/requests/blog"
import "./index.less"
const { Header, Content, Sider } = Layout

function EditManager() {
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


  return <div className="component-content-container edit-mamager-container">
    <RichText mode="edit" ref={richText} />
    <div className="save-btn-wrapper">
      <Button>保存草稿</Button>
      <Button loading={saveLoading} type="primary" onClick={onSubmit}>创建</Button>
    </div>
  </div>
}


export default function BlogIndex() {
  const [collapsed, setCollapsed] = useState(false)
  const onToggle = useCallback<(v?: boolean) => void>((broken?) => {
    if(broken !== undefined) {
      return setCollapsed(broken)
    }
    setCollapsed(!collapsed)
  }, [collapsed])
  return <Layout className="blog-manage-layout-container">
    <Sider
      trigger={null}
      collapsible
      collapsedWidth={0}
      collapsed={collapsed}
      onBreakpoint={onToggle}
    >
    </Sider>
    <Layout className="blog-manage-layout-content">
      <Header id="layout-header">
        <div className="collased-wrapper" onClick={() => onToggle()}>
          { collapsed ?  <MenuUnfoldOutlined /> : <MenuFoldOutlined /> }
        </div>
      </Header>
      <Content >
        <Outlet />
      </Content>
    </Layout>
  </Layout>
}