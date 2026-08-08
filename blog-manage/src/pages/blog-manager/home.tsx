import { useAppSelector } from "@/store"
import { useParams } from "umi"
import { HomeCatalogueTreeProps, HomeCatalogueTree } from "@/components/CatalogueTree"
import './home.less'
export default function Home() {
  const { folderId } = useParams();
  
  const folderInfo = useAppSelector(state => {
    return state.folder.entities[Number(folderId || '0')] || {}
  })
  const { ids: blogIds, entities } = useAppSelector(state => {
    return state.blog
  })

  const { title = '' } = folderInfo
  
  return <div className="home-container">
    <div className="folder-title-wrapper">
      {title}
    </div>
    <div className="catelogue-wrapper">
      <HomeCatalogueTree
        blogEntities={entities}
      />
    </div>
  </div>
}