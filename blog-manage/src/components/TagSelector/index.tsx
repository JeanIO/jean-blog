import { useEffect, useMemo, useState } from "react"
import { Input, Modal, Select, Tag, message } from "antd"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import Sketch from "@uiw/react-color-sketch"
import { getTags, createTag, deleteTag, type TagItem } from "@/requests/tag"
import "./index.less"

interface TagSelectorProps {
  /** 已选标签 id 列表 */
  value: number[]
  onChange?: (ids: number[]) => void
  /** edit：可选择（标题下的多选栏）；view：只读彩色标签 */
  mode: "edit" | "view"
}

/**
 * 标签选择器：自包含组件，自己拉全量标签、自己管"新建标签"弹窗。
 * 父组件只关心 value/onChange，保存时把 value 塞进 tag_ids 提交即可。
 */
export default function   TagSelector({ value, onChange, mode }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagItem[]>([])
  const [createVisible, setCreateVisible] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#1890ff") // 默认 antd 蓝
  const [creating, setCreating] = useState(false)

  // 拉全量标签；失败不阻塞编辑（下拉为空，仍可新建）
  useEffect(() => {
    getTags().then(setAllTags).catch(() => {})
  }, [])

  const tagMap = useMemo(() => new Map(allTags.map(t => [t.id, t])), [allTags])

  // 删除标签：确认后调后端（级联清关联），本地同步移除
  const onDeleteTag = (tag: TagItem) => {
    Modal.confirm({
      title: `删除标签「${tag.name}」？`,
      content: "删除后该标签会从所有博客上移除，且不可恢复",
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => deleteTag(tag.id).then(() => {
        setAllTags(prev => prev.filter(t => t.id !== tag.id))
        // 当前博客若选中了该标签，一并从已选里移除（触发父组件落库）
        if (value.includes(tag.id)) {
          onChange?.(value.filter(id => id !== tag.id))
        }
        message.success("标签删除成功")
      }).catch(() => {
        // 失败提示由请求拦截器统一处理（含 404 不存在）
      }),
    })
  }

  const onCreateTag = async () => {
    const name = newName.trim()
    if (!name) {
      message.warning("请输入标签名")
      return
    }
    setCreating(true)
    try {
      const tag = await createTag(name, newColor)
      setAllTags(prev => [tag, ...prev])
      onChange?.([...value, tag.id]) // 新建后自动选中
      setCreateVisible(false)
      setNewName("")
      message.success("标签创建成功")
    } catch (e) {
      // 失败提示由请求拦截器统一处理（含 409 重名）
    } finally {
      setCreating(false)
    }
  }

  // 浏览模式：只读彩色标签，没有标签则不占位置
  if (mode === "view") {
    if (value.length === 0) return null
    return (
      <div className="tag-selector tag-selector--view">
        {value.map(id => {
          const tag = tagMap.get(id)
          return tag ? <Tag key={tag.id} color={tag.color}>{tag.name}</Tag> : null
        })}
      </div>
    )
  }

  return (
    <>
      <Select
        className="tag-selector"
        mode="multiple"
        value={value}
        onChange={(ids) => onChange?.(ids as number[])}
        placeholder="添加标签..."
        bordered={false}
        options={allTags.map(tag => ({
          value: tag.id,
          label: (
            <span className="tag-option">
              <MinusOutlined
                className="tag-option-delete"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  onDeleteTag(tag)
                }}
              />
              <span className="tag-option-dot" style={{ background: tag.color }} />
              <span className="tag-option-name">{tag.name}</span>
            </span>
          ),
        }))}
        // 已选标签渲染成带颜色的 Tag（颜色从全量列表本地映射，不发多余请求）
        tagRender={(props) => {
          const tag = tagMap.get(Number(props.value))
          return (
            <Tag
              color={tag?.color}
              closable={props.closable}
              onClose={props.onClose}
              style={{ marginRight: 4 }}
            >
              {tag?.name ?? props.label}
            </Tag>
          )
        }}
        // 下拉底部固定"新建标签"入口
        dropdownRender={(menu) => (
          <>
            {menu}
            <div className="tag-selector-create" onClick={() => setCreateVisible(true)}>
              <PlusOutlined /> 新建标签
            </div>
          </>
        )}
      />
      <Modal
        title="新建标签"
        open={createVisible}
        confirmLoading={creating}
        onOk={onCreateTag}
        onCancel={() => setCreateVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <div className="tag-create-form">
          <Input
            placeholder="标签名（20 字以内）"
            maxLength={20}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onPressEnter={onCreateTag}
          />
          <Sketch
            color={newColor}
            onChange={(color) => setNewColor(color.hex)}
            style={{ marginTop: 16 }}
          />
        </div>
      </Modal>
    </>
  )
}
