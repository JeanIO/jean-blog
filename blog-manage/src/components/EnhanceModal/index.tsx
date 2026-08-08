import { isPromise } from "@/utils"
import { useState, useCallback, type ReactNode } from "react"
import { createRoot, Root } from "react-dom/client"

type OkType<T> = { onOk?: (value: T) => Promise<any> | void }
type EnhanceModalProps = {
  open: boolean,
  onCancel: () => void,
}

export type EnhanceUnifiedModalProps<T extends Object, U = any> = EnhanceModalProps & T & OkType<U>

function enhanceModal <P extends OkType<U>, U = any>(TargetModal: React.FC<EnhanceUnifiedModalProps<P, U>>) {
  let root: Root | null = null

  function SelfControlModal(props: P & { children?: ReactNode }) {
    const [isShow, setShow] = useState(true)
    const [isConfirmLoading, setConfirmLoading] = useState(false)
    const { onOk, ...restProps } = props

    const onCancel = useCallback(() => {
      setShow(false)
      setTimeout(() => {
        root?.unmount()
      }, 2000)
    }, [])

    const proxyOk = useCallback((v: U) => {
      if (onOk) {
        const res = onOk(v)
        if (isPromise(res)) {
          setConfirmLoading(true);
          (res as Promise<any>).then((res: any) => {
            console.log("请求回执", res)
          }).catch((e: unknown) => {
            console.error("似乎有点问题", e)
          }).finally(() => {
            setConfirmLoading(false)
          })
        }
      }
    }, [onOk])

    return <TargetModal
      {...restProps as P}
      open={isShow}
      confirmLoading={isConfirmLoading}
      onOk={proxyOk}
      onCancel={onCancel}
    />
  }

  SelfControlModal.show = (props: P) => {
    const div = document.createElement("div")
    document.body.appendChild(div)
    root = createRoot(div)
    root.render(<SelfControlModal {...props} />)
    return function() {
      root?.unmount()
      root = null
    }
  }

  SelfControlModal.displayName = `EnhanceModal(${TargetModal.displayName || 'Modal'})`

  return SelfControlModal
}

export default enhanceModal


// 声明一个名为 Shop 的命名空间
