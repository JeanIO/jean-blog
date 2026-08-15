
import { Outlet, useLocation, useParams, history } from "umi"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { message, Layout, Dropdown, Modal } from "antd"
import { MenuFoldOutlined, MenuUnfoldOutlined, LoadingOutlined, DownOutlined, BookOutlined } from "@ant-design/icons"
// import CatalogueTree, { CatalogueTreeProps } from "@/components/CatalogueTree"
import SiderCatalogueTree, { SiderCatalogueTreeProps } from "@/components/ArboristCatalogueTree"
import { BlogItem, createBlog, moveBlog, deleteBlog } from "@/requests/blog"
import { BlogFolder, getFolderList } from "@/requests/folder"
import { getBlogList } from "@/requests/blog"
import { useAppDispatch, useAppSelector } from "@/store"
import { setAll } from "@/store/folder"
import { setAll as setBlogAll, updateMany as updateBlogMany } from "@/store/blog"

const { Header, Content, Sider } = Layout
import "./index.less"
import { SiderContextProps } from "antd/lib/layout/Sider"


export default function BlogIndex() {
  const [collapsed, setCollapsed] = useState(false)
  const leftSpaceRef = useRef<HTMLDivElement>(null)
  const rightSpaceRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const [modal] = Modal.useModal()
  const location = useLocation()
  const onToggle = useCallback<(v?: boolean) => void>((broken?) => {
    if(broken !== undefined) {
      return setCollapsed(broken)
    }
    setCollapsed(!collapsed)
  }, [collapsed])

  const { folderId } = useParams();
  const [isFolderLoading, setFolderLoading] = useState(false)
  const [blogLoading, setBlogLoading] = useState<boolean>(false)
  const selectedKeys = useMemo(() => {
    const { pathname } = location
    if (pathname.endsWith("home")) {
      return ["home"]
    }
    const match = pathname.match(/\/(\d+)$/)
    if (match) {
      return [Number(match[1])]
    }
    return []
  }, [location.pathname])

  const { ids, entities } = useAppSelector(state => {
    return state.folder
  })
  const { ids: blogIds, entities: blogEntities = {} } = useAppSelector(state => {
    return state.blog
  })

  const onTreeNodeClick = useCallback<NonNullable<SiderCatalogueTreeProps["onTreeNodeClick"]>>((blogId) => {
    history.push(`/folders/${folderId}/${blogId}`)
  }, [folderId])
  
  useEffect(() => {
    setFolderLoading(true)
    getFolderList().then(folders => {
      dispatch(setAll(folders))
    }).finally(() => {
      setFolderLoading(false)
    })
    if(folderId === undefined) {
      message.error("请选择文件夹")
      return
    }
    setBlogLoading(true)
    getBlogList(Number(folderId)).then(blogs => {
      dispatch(setBlogAll(blogs))
    }).finally(() => {
      setBlogLoading(false)
    })

  }, [folderId])

  const onDrag = useCallback<NonNullable<SiderCatalogueTreeProps["onDrag"]>>((dragNode, parentNode, prevId) => {
    console.log("拖动", dragNode, parentNode, prevId)
    let content = ""
    if(parentNode !== null && dragNode.is_published !== parentNode.is_published && parentNode.is_published === 0) { // 将子博客放到了未发布的父博客下
      content = `检测到您正在把已发布的博客《${dragNode.title}》及子博客移动到《${parentNode.title}》的博客下方，您的博客将会被重置为未发布状态，是否继续？`
    } else {
      content = `您正在把《${dragNode.title}》及子博客移动到${parentNode === null ? "根目录" : '《' +parentNode.title + '》'}下`
    }
    Modal.confirm({
      title: "您确定要移动吗？",
      content,
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        return moveBlog({ blog_id: dragNode.id, folder_id: Number(folderId), parent_id: parentNode === null ? null : parentNode.id, prev_id: prevId }).then((data) => {
          console.log("cvv", data)
          const updateData = data.map(item => {
            return {
              id: item.id,
              parent_id: item.parent_id === undefined ?  blogEntities[item.id].parent_id : item.parent_id,
              update_date: item.update_date,
              is_published: item.is_published || blogEntities[item.id].is_published,
              sort_index: item.sort_index
            }
          })
          console.log("herer", updateData)
          dispatch(updateBlogMany(updateData))
        })
      }
    })
  }, [folderId, blogEntities, modal])

  const onDeleteBlog = useCallback<NonNullable<SiderCatalogueTreeProps["onDeleteBlog"]>>((blogId) => {
    Modal.confirm({
      title: "删除确认",
      content: `您确定要删除这篇博客吗？删除后将无法恢复。`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      onOk: () => {
        return deleteBlog(blogId).then(() => {
          // 从store中移除删除的博客
          // 注意：这里需要根据实际的store实现来更新状态
          message.success("博客删除成功")
          // 重新获取博客列表
          if(folderId) {
            getBlogList(Number(folderId)).then(blogs => {
              dispatch(setBlogAll(blogs))
            })
          }
        }).catch(() => {
          message.error("博客删除失败")
        })
      }
    })
  }, [folderId, dispatch])

  const onCreateChildBlog = useCallback<NonNullable<SiderCatalogueTreeProps["onCreateChildBlog"]>>((parentBlogId = null, prevId = null) => {
    createBlog({
      title: "《未命名博客标题》",
      content: "",
      folder_id: Number(folderId),
      parent_id: parentBlogId,
      prev_id: prevId
    }).then(() => {
      message.success("子博客创建成功")
      // 重新获取博客列表
      if(folderId) {
        getBlogList(Number(folderId)).then(blogs => {
          dispatch(setBlogAll(blogs))
        })
      }
    }).catch(() => {
      message.error("子博客创建失败")
    })
  }, [folderId, dispatch])
  // @ts-ignore
  const onSelectFolder = useCallback(({ key, domEvent }) => {
    domEvent.stopPropagation();
    history.push(`/folders/${key}/home`)
  }, [])
  
  const folderInfo = entities[Number(folderId)] || {}
  const { title = isFolderLoading ? "正在加载中..." : folderInfo.title, desc_info = ""} = folderInfo
  return <Layout className="blog-manage-layout-container">
    <Sider
      trigger={null}
      collapsible
      collapsedWidth={0}
      width={350}
      collapsed={collapsed}
      onBreakpoint={onToggle}
    >
      <div className="folder-tree-wrapper" style={{width: 350}}>
      <Dropdown
        menu={{
          items: ids.map(id => ({
            label: entities[id].title,
            key: id.toString(),
          }
        )),
        selectedKeys: [folderId || ''],
        onClick: onSelectFolder
      }}
      autoAdjustOverflow={false}
      placement="bottomLeft"
      trigger={["click"]}
      overlayStyle={{ maxHeight: 150, overflowY: "scroll", border: "1px solid #e7e8e9" }}
      >
        <div className="folder-title">
          <BookOutlined />
        {title}{isFolderLoading ? <LoadingOutlined /> :  <DownOutlined />}</div>
      </Dropdown>
        <SiderCatalogueTree
          blogEntities={blogEntities}
          rootId={null}
          folderId={folderId !== undefined ? Number(folderId) : undefined}
          onHomeClick={(fid) => history.push(`/folders/${fid}/home`)}
          onDrag={onDrag}
          onTreeNodeClick={onTreeNodeClick}
          selectedKeys={selectedKeys}
          activeKeys={selectedKeys.map(key => key.toString())}
          onDeleteBlog={onDeleteBlog}
          onCreateChildBlog={onCreateChildBlog}
        />
      </div>
    </Sider>
    <Layout className="blog-manage-layout-content">
      <Header id="layout-header">
        <div className="left-space-wrapper">
          <div className="collased-wrapper" onClick={() => onToggle()}>
            { collapsed ?  <MenuUnfoldOutlined /> : <MenuFoldOutlined /> }
          </div>
          <div id="left-space" ref={leftSpaceRef}></div>
        </div>
        <div id="right-space" ref={rightSpaceRef}></div>
      </Header>
      <Content >
        <Outlet context={{leftSpaceRef, rightSpaceRef}}/>
      </Content>
    </Layout>
  </Layout>
}
