import { Modal } from "antd"
import { useState, useCallback } from "react"
import { createRoot, Root } from "react-dom/client"

const enhanceModal = (TargetModal: typeof Modal) => {
  let root: Root | null = null

  function SelfControlModal(props) {
    const [isShow, setShow] = useState(false)
    const onCancel = useCallback(() => {
      setShow(false)
      setTimeout(() => {
        root?.unmount()
      }, 2000)
    }, [])
    return <TargetModal
      open={isShow}
      onCancel={onCancel}
      { ...props }
    />
  }
  SelfControlModal.displayName = `EnhanceModal(${TargetModal.displayName})`
  SelfControlModal.show = (props: any = {}) => {
    // const modal = React.createElement(Modal);
    root = createRoot(document.body)
    root.render(<SelfControlModal
      { ...props }
    />)
  }

}

export default enhanceModal