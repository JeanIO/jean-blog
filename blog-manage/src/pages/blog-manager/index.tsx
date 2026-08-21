
import { Outlet, useLocation, useParams, history } from "umi"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { message, Layout, Dropdown, Modal } from "antd"
import { MenuFoldOutlined, MenuUnfoldOutlined, LoadingOutlined, DownOutlined, BookOutlined } from "@ant-design/icons"
import SiderCatalogueTree, { SiderCatalogueTreeProps } from "@/components/ArboristCatalogueTree"
import { BlogItem, createBlog, moveBlog, deleteBlog, publishBlog } from "@/requests/blog"
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
    // /folders/:folderId/home → 激活首页
    if (pathname.endsWith("/home")) {
      return ["home"]
    }
    // 仅 /folders/:folderId/:blogId 结构才提取 blogId，避免把 folderId 误判成博客 id
    const match = pathname.match(/\/folders\/\d+\/(\d+)$/)
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
    const targetPath = `/folders/${folderId}/${blogId}`
    if (location.pathname === targetPath) return // 已在目标页，避免重复 push 造成历史记录堆积
    history.push(targetPath)
  }, [folderId, location.pathname])

  // 稳定引用：避免 CatalogueTree 的 memo 因内联函数/新数组失效
  const onHomeClick = useCallback<NonNullable<SiderCatalogueTreeProps["onHomeClick"]>>((fid) => {
    history.push(`/folders/${fid}/home`)
  }, [])

  const activeKeys = useMemo(() => selectedKeys.map(key => key.toString()), [selectedKeys])
  
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
          const updateData = data.map(item => {
            return {
              id: item.id,
              parent_id: item.parent_id === undefined ?  blogEntities[item.id].parent_id : item.parent_id,
              update_date: item.update_date,
              is_published: item.is_published ?? blogEntities[item.id].is_published,
              sort_index: item.sort_index
            }
          })
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

  const onPublishBlog = useCallback<NonNullable<SiderCatalogueTreeProps["onPublishBlog"]>>((blogId, publishStatus) => {
    const doPublish = (withChildren: number) => {
      publishBlog(blogId, publishStatus, withChildren).then(() => {
        message.success(publishStatus === 1 ? "博客发布成功" : "博客已下架")
        // 重新获取博客列表
        if(folderId) {
          getBlogList(Number(folderId)).then(blogs => {
            dispatch(setBlogAll(blogs))
          })
        }
      }).catch(() => {
        message.error(publishStatus === 1 ? "博客发布失败" : "博客下架失败")
      })
    }

    if (publishStatus === 0) {
      // 下架确认：将连同所有子博客一起下架（强制级联，不可选择）
      Modal.confirm({
        title: "确认是否下架？",
        content: "下架后该博客及其所有子博客将一并下架",
        okText: "下架",
        cancelText: "取消",
        okType: "danger",
        onOk: () => doPublish(0),
      })
      return
    }

    // 发布：判断是否存在子博客，决定确认文案与是否连同子博客发布
    const hasChildren = Object.values(blogEntities).some(item => item.parent_id === blogId)
    if (!hasChildren) {
      Modal.confirm({
        title: "确认是否发布？",
        okText: "发布",
        cancelText: "取消",
        onOk: () => doPublish(0),
      })
    } else {
      Modal.confirm({
        title: "是否连同子博客一起发布？",
        content: "该博客存在子博客：确定将连同子博客一起发布；取消则仅发布该博客本身",
        okText: "连同子博客一起发布",
        cancelText: "仅发布该博客",
        onOk: () => doPublish(1),
        // 取消并不是真的取消：转为独自发布该博客
        onCancel: () => doPublish(0),
      })
    }
  }, [folderId, dispatch, blogEntities])

  const onCreateChildBlog = useCallback<NonNullable<SiderCatalogueTreeProps["onCreateChildBlog"]>>((parentBlogId = null, prevId = null) => {
    createBlog({
      title: "未命名博客标题",
      content: "",
      folder_id: Number(folderId),
      parent_id: parentBlogId,
      prev_id: prevId
    }).then((res) => {
      message.success("子博客创建成功")
      // 重新获取博客列表
      if(folderId) {
        getBlogList(Number(folderId)).then(blogs => {
          dispatch(setBlogAll(blogs))
        })
      }
      // 自动跳转到新创建的博客页面
      if (res.id !== undefined && folderId !== undefined) {
        history.push(`/folders/${folderId}/${res.id}`)
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
          onHomeClick={onHomeClick}
          onDrag={onDrag}
          onTreeNodeClick={onTreeNodeClick}
          selectedKeys={selectedKeys}
          activeKeys={activeKeys}
          onDeleteBlog={onDeleteBlog}
          onCreateChildBlog={onCreateChildBlog}
          onPublishBlog={onPublishBlog}
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
