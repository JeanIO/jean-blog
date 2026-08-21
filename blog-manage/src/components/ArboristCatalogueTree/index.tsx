import { useMemo, useCallback, useRef, memo } from "react"
import { CaretRightOutlined, CaretDownOutlined, HomeOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { Tree, type NodeRendererProps, type DragPreviewProps } from "react-arborist"
import { BlogItem } from "@/requests/blog"
import { Dropdown, type MenuProps } from "antd"
import type { NodeApi, TreeApi } from "react-arborist"
import { sortedIndexBy } from 'lodash'
import { BlogFolder } from "@/requests/folder"
export { default as HomeCatalogueTree, type HomeCatalogueTreeProps } from "./HomeCatalogueTree"
import "./index.less"

export type SiderCatalogueTreeProps = {
  blogEntities: Record<BlogItem["id"], BlogItem>
  rootId?: number | null
  folderId?: number
  onTreeNodeClick?: (blogId: string) => void
  onHomeClick?: (folderId: number) => void
  className?: string
  onDrag?: (dragNode: BlogItem, parent_id: BlogItem | null, prevId: number | null) => void
  selectedKeys?: (string | number)[]
  activeKeys?: string[]
  onCreateChildBlog?: (parentBlogId: number | null, prevId: number | null) => void
  onDeleteBlog?: (blogId: number) => void
  onPublishBlog?: (blogId: number, publishStatus: number) => void
}


export type ArboristNode = {
  [key in Exclude<keyof BlogItem, 'id'> ]: BlogItem[key]
} & {
  id: string,
  children: Array<ArboristNode>
}

/** 将节点按 sort_index 升序插入同级列表，保证同级有序 */
function insertNodeBySortIndex(siblings: ArboristNode[], node: ArboristNode) {
  const index = sortedIndexBy(siblings, node, (item) => item.sort_index)
  siblings.splice(index, 0, node)
}

/** 取同级节点中 sort_index 最大的节点 id，作为新节点插入末尾的 prev_id */
function getMaxSortSiblingId(
  entities: Record<BlogItem["id"], BlogItem>,
  parentId: number | null,
): number | null {
  let maxId: number | null = null
  let maxSort = -Infinity
  Object.values(entities).forEach((item) => {
    if (item.parent_id === parentId && item.sort_index > maxSort) {
      maxSort = item.sort_index
      maxId = item.id
    }
  })
  return maxId
}

/** 将扁平的 entities 转为 react-arborist 的树结构 */
export function buildTree(
  entities: Record<BlogItem["id"], BlogItem>,
  rootId: number | null,
): ArboristNode[] {
  const entityMap = new Map<string, ArboristNode>()
  const roots: ArboristNode[] = [
  ]

  Object.values(entities).forEach((item) => {
    const node: ArboristNode = {
      ...item,
      id: String(item.id),
      children: [],
    }
    entityMap.set(String(item.id), node)
  })

  entityMap.forEach((node) => {
    if (node.parent_id === rootId) {
      insertNodeBySortIndex(roots, node)
    } else if (node.parent_id !== null) {
      const parent = entityMap.get(String(node.parent_id))
      if (!parent) {
        console.log("这个id的父节点找不到", node.id)
        return
      }
      insertNodeBySortIndex(parent.children, node)
    }
  })
  return roots
}

const CatalogueTree = memo((props: SiderCatalogueTreeProps) => {
  console.log("CatalogueTree render", props)
  const {
    blogEntities = {},
    rootId = null,
    folderId,
    onTreeNodeClick,
    onHomeClick,
    className,
    onDrag,
    selectedKeys,
    onCreateChildBlog,
    onDeleteBlog,
    onPublishBlog,
  } = props

  const treeRef = useRef<TreeApi<ArboristNode>>(null)

  const treeData = useMemo<ArboristNode[]>(
    () => buildTree(blogEntities, rootId),
    [blogEntities, rootId],
  )

  const onMenuSelect = useCallback(
    (blogId: number, action: string) => {
      if (action === "ADD_CHILD") {
        console.log("er", blogId)
        // 新子节点要排到同级末尾：取同级最大 sort_index 的节点 id 作为 prev_id
        const prevId = getMaxSortSiblingId(blogEntities, blogId)
        onCreateChildBlog?.(blogId, prevId)
      } else if (action === "DELETE") {
        onDeleteBlog?.(blogId)
      } else if (action === "PUBLISH") {
        const target = blogEntities[blogId]
        if (target) {
          // 已发布 → 下架；未发布 → 发布
          onPublishBlog?.(blogId, target.is_published === 1 ? 0 : 1)
        }
      }
    },
    [onCreateChildBlog, onDeleteBlog, onPublishBlog, blogEntities],
  )

  const onMove = useCallback(
    (args: { dragIds: string[]; parentId: string | null; index: number }) => {
      const { dragIds, parentId, index } = args
      const dragId = Number(dragIds[0])
      const dragNode = blogEntities[dragId]
      if (!dragNode) return

      // 归一化目标父节点 id：null 与 "home" 都表示根目录
      const targetParentId =
        parentId === null || parentId === "home" ? null : Number(parentId)

      // 新同级列表：同 parent 且排除被拖节点，按 sort_index 升序（与树的展示顺序一致）
      const siblings = Object.values(blogEntities)
        .filter(
          (item) =>
            item.parent_id === targetParentId &&
            !dragIds.includes(String(item.id)),
        )
        .sort((a, b) => a.sort_index - b.sort_index)

      // 前序节点 = 插入位置前一个；插到最前则 prev_id 为 null
      const prevNode = index > 0 ? siblings[index - 1] : null

      onDrag?.(
        dragNode,
        targetParentId === null ? null : blogEntities[targetParentId],
        prevNode ? prevNode.id : null,
      )
    },
    [onDrag, blogEntities],
  )

  const onSelect = useCallback(
    (nodes: NodeApi<ArboristNode>[]) => {
      const selected = nodes[0]
      if (selected) {
        onTreeNodeClick?.(selected.id)
      }
    },
    [onTreeNodeClick],
  )

  /** 自定义节点渲染 */
  const NodeRenderer = useCallback(
    ({ node, style, dragHandle }: NodeRendererProps<ArboristNode>) => {
      const { data } = node
      const blog = data
      // 选中态由页面解析 URL 后的 selectedKeys 决定：包含当前 id 即选中
      const isSelected = selectedKeys?.some(key => String(key) === node.id) ?? false
      const menuItems: MenuProps["items"] = [
        {
          key: "ADD_CHILD",
          label: "创建子博客",
          onClick: () => onMenuSelect(Number(blog.id), "ADD_CHILD"),
        },
        {
          key: "DELETE",
          label: "删除博客",
          onClick: () => onMenuSelect(Number(blog.id), "DELETE"),
        },
        {
          key: "PUBLISH",
          label: blog.is_published === 1 ? "下架" : "发布",
          onClick: () => onMenuSelect(Number(blog.id), "PUBLISH"),
        },
      ]

      return (
        <div
          style={{ ...style, lineHeight: '36px' }}
          ref={dragHandle}
          className="arborist-node-wrapper"
        >
          <div className={`arborist-node ${isSelected ? "arborist-node--selected" : ""} ${node.isDragging ? "arborist-node--dragging" : ""}`}>
            <div className="arborist-node__content">
              {/* 折叠/展开图标 */}
              {node.children?.length ?  (
                <span
                  className="arborist-node__arrow"
                  onClick={(e) => { e.stopPropagation(); node.toggle() }}
                >
                  {node.isOpen ? <CaretDownOutlined/> : <CaretRightOutlined />}
                </span>
              ) : (
                <span className="arborist-node__arrow arborist-node__arrow--placeholder" />
              )}
              {/* 发布状态标识：已发布绿色光晕、未发布灰色 */}
              <span
                className={`arborist-node__published-dot ${blog.is_published === 1 ? "arborist-node__published-dot--published" : ""}`}
              />
              <span className="arborist-node__title">{blog.title}</span>
              <div
                className="arborist-node__actions"
                // onClick={(e) => e.stopPropagation()}
              >
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={["click"]}
                >
                  <MoreOutlined onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      )
    },
    [onTreeNodeClick, onMenuSelect, selectedKeys],
  )

  /** 拖拽时跟随鼠标的透明预览 */
  const DragPreview = useCallback(
    (props: DragPreviewProps) => {
      const { id, isDragging, mouse } = props
      if (!id || !isDragging) return null

      const node = treeRef.current?.get(id)
      if (!node) return null

      return (
        <div
          className="arborist-drag-preview"
          style={{
            position: "fixed",
            left: (mouse?.x ?? 0) + 12,
            top: (mouse?.y ?? 0) - 18,
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {node.data.title}
        </div>
      )
    },
    [],
  )
  const handleHomeClick = useCallback(() => {
    if (folderId !== undefined) {
      onHomeClick?.(folderId)
    }
  }, [folderId, onHomeClick])

  const handleCreateRootBlog = useCallback(() => {
    // 根目录新建：取根级同级最大 sort_index 的节点 id 作为 prev_id
    const prevId = getMaxSortSiblingId(blogEntities, rootId)
    onCreateChildBlog?.(null, prevId)
  }, [onCreateChildBlog, blogEntities, rootId])

  return (
    <div className={`${className ?? ""} arborist-catalogue-tree`}>
      {/* 首页节点（独立于树之外） */}
      <div
        className={`arborist-home-bar ${selectedKeys?.includes("home") ? "arborist-home-bar--active" : ""}`}
        onClick={handleHomeClick}
      >
        <span className="arborist-home-bar__left">
          <HomeOutlined className="arborist-home-bar__icon" />
          <span className="arborist-home-bar__title">首页</span>
        </span>
        <PlusOutlined
          className="arborist-home-bar__plus"
          onClick={(e) => {
            e.stopPropagation()
            handleCreateRootBlog()
          }}
        />
      </div>

      <Tree<ArboristNode>
        ref={treeRef}
        data={treeData}
        width="100%"
        rowHeight={30}
        onMove={onMove}
        onSelect={onSelect}
        renderDragPreview={DragPreview}
        openByDefault
      >
        {NodeRenderer}
      </Tree>
    </div>
  )
})

export default CatalogueTree