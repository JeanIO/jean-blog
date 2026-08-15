import dayjs from "dayjs"
import { useMemo, useCallback, useState, useEffect } from "react"
import { BlogItem } from "@/requests/blog"
import { HomeOutlined, MoreOutlined } from "@ant-design/icons"
import { Divider, Tree, TreeProps, Dropdown, type MenuProps } from "antd"
import "./index.less"

export type CatalogueTreeProps = {
  blogEntities: Record<BlogItem["id"], BlogItem>,
  rootId?: number | null,
  onTreeNodeClick?: (bolgId: string) => void,
  className?: string,
  onDrag?: (dragNode: BlogItem, parent_id: BlogItem | null) => void,
  selectedKeys?: (string | number)[],
  activeKeys?: string[],
  onCreateChildBlog?: (parentBlogId: number | null) => void,
  onDeleteBlog?: (blogId: number) => void
}

type BlogNodeData = (BlogItem & { children: BlogNodeData[] })
type HomeItem = { id: "home", title: "首页", parent_id: null, children: BlogNodeData[] }
type TreeNodeData = BlogNodeData | HomeItem
// type Entities = { [K in TreeNodeData["id"]]?: Extract<TreeNodeData, { id: K }> }
type Entities = { "home"?: HomeItem } & Record<BlogItem["id"], BlogNodeData>

export default function CatalogueTree(props: CatalogueTreeProps) {
  const { blogEntities = [], rootId = null, onTreeNodeClick, className, onDrag, selectedKeys, activeKeys, onCreateChildBlog, onDeleteBlog } = props
  const treeData = useMemo(() => {
    let root: Array<TreeNodeData> = [{ id: "home", title: "首页", parent_id: null, children: [] }]
    let entities: Entities = { "home": { id: "home", title: "首页", parent_id: null, children: [] } }
    const blogList = Object.values(blogEntities).map<TreeNodeData>((item) => {
      let body = { ...item, children: [] }
      entities[item.id] = body
      return body
    })
    blogList.forEach((item) => {
      if (item.parent_id === rootId) {
        return root.push(item)
      }
      if (item.id !== "home" && item.parent_id !== null) {
        return entities[item.parent_id]?.children?.push(item)
      }
    })
    return root
  }, [blogEntities])
  const onClick = useCallback<NonNullable<TreeProps["onClick"]>>((_, node) => {
    const { key } = node
    onTreeNodeClick && onTreeNodeClick(key as string)
  }, [onTreeNodeClick])

  const onMenuSelect = useCallback((blogId: number, action: string) => {
    if (action === 'ADD_CHILD') {
      onCreateChildBlog?.(blogId)
      console.log("here")
    } else if (action === 'DELETE') {
      onDeleteBlog?.(blogId);
    }
  }, [onCreateChildBlog, onDeleteBlog]);

  const renderTreeNode = useCallback((root: TreeNodeData[]) => {
    return root.map((item) => {
      if (item.id === "home") {
        return <Tree.TreeNode
          title={item.title}
          switcherIcon={<HomeOutlined />}
          key={item.id}
        />
      } else {
        const menuItems: MenuProps['items'] = [
          {
            key: 'ADD_CHILD',
            label: '创建子博客'
          },
          {
            key: 'DELETE',
            label: '删除博客'
          }
        ];
        
        const nodeTitle = (
          <div className="node-title-wrapper">
            <span>{item.title}</span>
            <div className="node-operation-wrapper" onClick={(e) => e.stopPropagation()}>
              <Dropdown 
                menu={{ 
                  items: menuItems,
                  onSelect: (info) => {
                    info.domEvent.stopPropagation();
                    onMenuSelect(item.id, info.key);
                  }
                }} 
                trigger={['click']}
              >
                <MoreOutlined 
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        );
        
        return <Tree.TreeNode
          title={nodeTitle}
          key={item.id}
        >
          {renderTreeNode(item.children)}
        </Tree.TreeNode>
      }
    })
  }, [treeData, onMenuSelect])
  const onDragFun = useCallback((v: any) => {
    if (v.dropToGap) { // 说明要移动到根节点
      const { dragNodesKeys } = v
      const dragRootNode = Number(dragNodesKeys[0])
      onDrag?.(blogEntities[dragRootNode], null)
      return
    } else {
      const { node, dragNode } = v
      if (node.dragOver) { // 说明要放到这个节点下边
        onDrag?.(blogEntities[Number(dragNode.key)], blogEntities[Number(node.key)])
      }
      // 目前没遇到别的情况
    }
  }, [onDrag, blogEntities])
  return <Tree
    className={`${className} catalogue-tree-sider`}
    onDrop={onDragFun}
    blockNode
    selectedKeys={selectedKeys}
    activeKey={activeKeys?.[0]}
    onClick={onClick}
    draggable={{
      icon: false,
      nodeDraggable: (item) => {
        if (item.key === "home") {
          return false
        }
        return true
      }
    }}
  >
    {renderTreeNode(treeData)}
  </Tree>
}

export type HomeCatalogueTreeProps = Pick<CatalogueTreeProps, "blogEntities" | "rootId" | "className" | "onTreeNodeClick">
export const HomeCatalogueTree = (props: HomeCatalogueTreeProps) => {
  const { className, blogEntities, rootId = null, onTreeNodeClick } = props
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const onExpandChange = useCallback((value: React.Key[]) => {
    setExpandedKeys(value)
  }, [])
  const onClick = useCallback<NonNullable<TreeProps["onClick"]>>((_, item) => {
    const { key } = item
    onTreeNodeClick && onTreeNodeClick(key as string)
  }, [onTreeNodeClick])
  const [treeData, computedExpandedKeys] = useMemo(() => {
    const entities: Entities = {}
    const root: Array<BlogNodeData> = []
    const expandedKeys: React.Key[] = []
    const keys: React.Key[] = []
    const blogList: BlogNodeData[] = Object.values(blogEntities).map<BlogNodeData>((item) => {
      let body = { ...item, children: [] }
      entities[item.id] = body
      return body
    })
    blogList.forEach((item) => {
      expandedKeys.push(''+item.id)
      keys.push(item.id)
      if (item.parent_id === rootId) {
        return root.push(item)
      }
      if (item.parent_id !== null) {
        return entities[item.parent_id]?.children?.push(item)
      }
    })
    return [root, expandedKeys]
  }, [blogEntities])
  useEffect(() => {
    setExpandedKeys(computedExpandedKeys)
  }, [computedExpandedKeys])
  const renderTreeNode = useCallback((root: BlogNodeData[]) => {
    return root.map((item) => {
      const { create_date, title } = item
      const date = dayjs(create_date)
      return <Tree.TreeNode
        title={
          <div className="title-node-wrapper">
            <span className="title-wrapper">{title}</span>
            <Divider dashed />
            <span className="create-date-wrapper">{
              date.format("YYYY-MM-DD HH:mm")
            }</span>
          </div>
        }
        key={item.id}
      >
        {renderTreeNode(item.children)}
      </Tree.TreeNode>
    })
  }, [])
  return <Tree
    blockNode
    className={`${className} home-catalogue-tree`}
    expandedKeys={expandedKeys}
    onExpand={onExpandChange}
    onClick={onClick}
  >
    {renderTreeNode(treeData)}
  </Tree>
}