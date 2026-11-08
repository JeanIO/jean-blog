import { useCallback, useEffect } from "react"
import { useAppSelector } from "@/store"
import { useParams, history } from "umi"
import { getBlogList } from "@/requests/blog"
import HomeCatalogueTree from "@/components/ArboristCatalogueTree/HomeCatalogueTree"
import './home.less'

export default function Home() {
  const { folderId } = useParams();
  const folderInfo = useAppSelector(state => {
    return state.folder.entities[Number(folderId || '0')] || {}
  })
  const { title = '' } = folderInfo
  const { entities } = useAppSelector(state => {
    return state.blog
  })


  const onTreeNodeClick = useCallback((blogId: string) => {
    history.push(`/folders/${folderId}/${blogId}`)
  }, [folderId])



  return <div className="home-container">
    <div className="folder-title-wrapper">
      {title}
    </div>
    <div className="catelogue-wrapper">
      <HomeCatalogueTree
        blogEntities={entities}
        onTreeNodeClick={onTreeNodeClick}
      />
    </div>
  </div>
}
