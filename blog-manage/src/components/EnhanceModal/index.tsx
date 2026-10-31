import { noop } from "lodash"
import {
  useState,
  useImperativeHandle, forwardRef, createRef,
  type FunctionComponent, type ComponentType, type RefAttributes,
} from "react"
import { createRoot } from "react-dom/client"

type EnhanceModalProps<T> = {
  onOk?: (arg: T) => Promise<any>,
  onClose: () => void
}

// 目标Modal应该具备的Props
export type EnTargetModalProps<P extends object = {}, Info = void> = P & { open: boolean } & EnhanceModalProps<Info>
export type EnhanceTargetComp<T extends object> = FunctionComponent<EnTargetModalProps<T>>

/** 通过 ref 暴露给外部的命令式句柄 */
export type EnhanceModalHandle = {
  /** 触发关闭动画，随后自动卸载 */
  close: () => void
}

export default function enhanceModal<T extends object>(TargetModal: EnhanceTargetComp<T>) {

  // 外层用 forwardRef 包裹，把 close 句柄暴露给调用方（泛型写在 forwardRef 的调用上）
  const SelfControlModal = forwardRef<EnhanceModalHandle, Omit<EnTargetModalProps<T>, "open">>(
    (props, ref) => {
      // forwardRef 的 PropsWithoutRef 会把"泛型 Omit"拆坏，解构前先断言回原始 props 类型
      const { onOk, onClose, ...rest } = props as Omit<EnTargetModalProps<T>, "open">
      const [open, setOpen] = useState(true)

      // 暴露 close 给 ref；show() 返回的关闭函数就调它
      useImperativeHandle(ref, () => ({
        close: () => {
          setOpen(false)
        }
      }), [])
  

      const handleOk = onOk || noop

      const targetProps = {
        ...rest,
        open,
        onClose,
        onOk: handleOk,
      } as EnTargetModalProps<T>

      return <TargetModal {...targetProps} />
    }
  )

  // 给 forwardRef 组件挂上 show 静态方法（onClose 由 show 内部注入，调用方不用传）
  const Enhanced = SelfControlModal as typeof SelfControlModal & {
    show: (props: Omit<EnTargetModalProps<T>, "open" | "onClose">) => () => void
  }

  Enhanced.displayName = `EnhanceModal(${TargetModal.displayName || "Modal"})`

  /** 命令式打开 Modal，返回关闭函数 */
  Enhanced.show = (props: Omit<EnTargetModalProps<T>, "open" | "onClose">) => {
    const ref = createRef<EnhanceModalHandle>()
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    // PropsWithoutRef<Omit<泛型...>> 无法参与 JSX 检查，用 ComponentType 别名绕过
    const Renderable = SelfControlModal as unknown as ComponentType<Omit<EnTargetModalProps<T>, "open"> & RefAttributes<EnhanceModalHandle>>
    // 幂等守卫：快速连点关闭时只生效一次，
    // 否则第二个定时器会去 removeChild 一个已经不在 body 下的节点 → NotFoundError
    let closed = false
    const onClose = () => {
      if (closed) return
      closed = true

      ref.current?.close()   // 先走关闭动画（若还没挂载完 ref.current 为 null，跳过即可）

      setTimeout(() => {
        root.unmount()
        container.remove()
      }, 500)
    }
    const innerProps = { ...props, onClose } as unknown as Omit<EnTargetModalProps<T>, "open">
    root.render(<Renderable ref={ref} {...innerProps} />)

    return onClose
  }

  return Enhanced
}
