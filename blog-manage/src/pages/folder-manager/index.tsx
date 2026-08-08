import { useState, useEffect, useCallback, MouseEventHandler } from "react"
import { getFolderList, deleteFolder, updateFolder } from "@/requests/folder"
import { Layout } from "antd"
import { Button, Card, Spin, Divider, Empty, Dropdown, Modal, message } from "antd"
import { EllipsisOutlined } from "@ant-design/icons"
import { setAll, removeMany, updateMany } from "@/store/folder"
import { useAppSelector, useAppDispatch } from "@/store"
import { BlogFolder } from "@/requests/folder"
import ModalFolderEdit from "@/components/ModalFolderEdit"
import './index.less'
const { Header, Sider, Content } = Layout
type FolderCardProps = {
  data: BlogFolder,
  onRemove: <T = any>(id: BlogFolder["id"]) => Promise<T>
  onSetting: <T = any>(id: BlogFolder) => Promise<T>,
  onClick: (id: number) => void
}

function BlogFolderCard(props: FolderCardProps) {
  const { data, onSetting, onRemove, onClick } = props
  const handleClick = useCallback(() => {
    onClick(data.id)
  }, [data, onClick])
  const iconClick = useCallback<MouseEventHandler>(e => {
    e.stopPropagation()
  }, [])
  const onMenuItemClick = useCallback((value: any) => {
    const { key, domEvent } = value
    domEvent.stopPropagation()
    if(key === "del") {
      Modal.confirm({
        title: "删除确认",
        content: <>
        您确定要删除<span className="blog-project-primary-text">{data.title}</span>文件夹吗？
        <span className="blog-project-primary-text">(删除后该文件夹下的所有博客内容均会被删除)</span>
        </>,
        onOk: () => {
          return onRemove(data.id)
        }
      })
    } else {
    //  ModalFolderEdit.show({
    //   folderInfo: data,
    //   onOk: (values: BlogFolder) => {
    //     return onSetting(values).then(() => {
    //       message.success("更新成功")
    //     })
    //   }
    //  })
  return <Card
    className="blog-folder-card"
    hoverable
    onClick={handleClick}
    title={<>
      <span className="card-title">{data.title}</span>
      <Dropdown
       menu={{
        items: [
          { label:"设置", key: "setting",  },
          { label: "删除", key:"del", danger: true }
        ],
        onClick: onMenuItemClick
       }}
       trigger={["click"]}
       placement="bottom"
      >
        {/*阻止事件冒泡*/}
        <EllipsisOutlined onClick={iconClick}/>
      </Dropdown>
    </>}
  >
    {data.desc_info || ''}
  </Card>
}

export default function FolderManager() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getFolderList().then(folders => {
      dispatch(setAll(folders))
    }).finally(() => {
      setLoading(false)
    })
  }, [])
  const folder = useAppSelector(state => {
    console.log(state)
    return state.folder
  })
  const { ids, entities } = folder
  const onRemove = useCallback<FolderCardProps["onRemove"]>((id) => {
    return deleteFolder(id).then((v) => {
      message.success("删除成功")
      dispatch(removeMany([id]))
      return v
    })
  }, [])

  const onUpdate = useCallback<FolderCardProps["onSetting"]>((data) => {
    return updateFolder(data).then(v => {
      dispatch(updateMany([v]))
    })
  }, [])

  const onClick = useCallback((id: number) => {
    // const folderInfo = entities[id]
    // history.push(`/folders/${}`)
    window.open(`/folders/${id}/home`)
  }, [entities])
  return <div className="blog-folder-manager">
    <div className="folder-manager-title">
      <span className="title">知识库</span>
      <Divider orientation="right">
        <Button type="primary">添加 + </Button>
      </Divider>
    </div>
    <div className="folder-card-list-container">
      {loading ? <Spin /> : <div className="folder-card-list-wrapper">
        {ids.length ? ids.map(id => {
          return <BlogFolderCard
            key={id}
            data={entities[id]}
            onRemove={onRemove}
            onSetting={onUpdate}
            onClick={onClick}
          />
        }) :  <Empty className="empty-block" description={false}></Empty>}
      </div>
      }
    </div>
  </div>
}
