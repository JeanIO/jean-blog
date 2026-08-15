import dayjs from "dayjs"
import { useMemo, useCallback } from "react"
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons"
import { Tree, type NodeRendererProps } from "react-arborist"
import { Divider } from "antd"
import type { NodeApi } from "react-arborist"
import { BlogItem } from "@/requests/blog"
import { buildTree, type ArboristNode } from "./index"
import "./index.less"

export type HomeCatalogueTreeProps = {
  blogEntities: Record<BlogItem["id"], BlogItem>
  rootId?: number | null
  className?: string
  onTreeNodeClick?: (blogId: string) => void
  height?: number
}

/** 首页博客目录树：全部展开、支持点击跳转、不支持拖拽 */
export default function HomeCatalogueTree(props: HomeCatalogueTreeProps) {
  const { className, blogEntities = {}, rootId = null, onTreeNodeClick, height = 600 } = props

  const treeData = useMemo<ArboristNode[]>(
    () => buildTree(blogEntities, rootId),
    [blogEntities, rootId],
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

  /** 节点：标题在行首、虚线分隔填充、创建日期在行末 */
  const NodeRenderer = useCallback(
    ({ node, style }: NodeRendererProps<ArboristNode>) => {
      const { title, create_date } = node.data

      return (
        <div style={style} className="arborist-node-wrapper">
          <div className={`arborist-node ${node.isSelected ? "arborist-node--selected" : ""}`}>
            <div className="arborist-node__content arborist-node__content--home">
              {/* 折叠/展开图标 */}
              {node.children?.length ? (
                <span
                  className="arborist-node__arrow"
                  onClick={(e) => { e.stopPropagation(); node.toggle() }}
                >
                  {node.isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
                </span>
              ) : (
                <span className="arborist-node__arrow arborist-node__arrow--placeholder" />
              )}
              <span className="arborist-node__title arborist-node__title--home">{title}</span>
              <Divider dashed className="arborist-node__divider" />
              <span className="arborist-node__date">
                {dayjs(create_date).format("YYYY-MM-DD HH:mm")}
              </span>
            </div>
          </div>
        </div>
      )
    },
    [],
  )

  return (
    <Tree<ArboristNode>
      data={treeData}
      className={`${className ?? ""} arborist-catalogue-tree arborist-home-tree`}
      width="100%"
      height={height}
      rowHeight={30}
      onSelect={onSelect}
      disableDrag
      openByDefault
    >
      {NodeRenderer}
    </Tree>
  )
}
