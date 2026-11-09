import { CheckCircleFilled, LoadingOutlined, SyncOutlined, PauseCircleOutlined, CloudUploadOutlined } from "@ant-design/icons"
import "./index.less"

export type AutoSaveStatus = "idle" | "saving" | "saved"

export type AutoSaveIndicatorProps = {
  /** 保存状态：idle=自动保存待命 / saving=保存中 / saved=已保存 */
  status: AutoSaveStatus
  /** 保存成功时间，如 "14:30:05"，status 为 saved 时展示 */
  savedAt?: string | null
  /** 自动保存是否开启 */
  autoSaveEnabled: boolean
}

/** 自动保存状态指示器（完全受控，由使用方传入状态） */
export default function AutoSaveIndicator(props: AutoSaveIndicatorProps) {
  const { status, savedAt, autoSaveEnabled } = props

  if (!autoSaveEnabled) {
    return (
      <span className="autosave-indicator autosave-indicator--disabled">
        <PauseCircleOutlined /> 自动保存已关闭
      </span>
    )
  }

  if (status === "saving") {
    return (
      <span className="autosave-indicator autosave-indicator--saving">
        <LoadingOutlined /> 保存中...
      </span>
    )
  }

  if (status === "saved" && savedAt) {
    return (
      <span className="autosave-indicator autosave-indicator--saved">
        <CheckCircleFilled /> 已保存 {savedAt}
      </span>
    )
  }

  return (
    <span className="autosave-indicator autosave-indicator--idle">
      <CloudUploadOutlined />自动保存待命
    </span>
  )
}
