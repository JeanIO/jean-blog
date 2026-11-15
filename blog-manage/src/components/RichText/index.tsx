import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { createPortal } from "react-dom"
import { getFileCosKey, getCOSAuth } from "@/requests/service"
import TextAreaAutoResize from "react-textarea-autosize"
import { message, Spin } from "antd"
import cossdk from "cos-js-sdk-v5"
import AutoSaveIndicator, { type AutoSaveStatus } from "@/components/AutoSaveIndicator"
import yuqueAddress from "./yuque.json"
import './index.less'

/** 格式化保存时间为 HH:mm:ss */
function formatTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

type RichTextProps = {
  mode: "view" | "edit",
  isLoading?: boolean,
  docContent?: {
    title: string,
    content: string
  },
  /** 自动保存方法，由使用方（EditManager）提供，返回 Promise 以便跟踪保存状态 */
  onAutoSave?: (title: string, content: string) => Promise<void> | void,
  autoSaveDelay?: number,

}

interface RichTextRef {
  getInfo: (title: string, content: string) => { title: string, content: string }
}

const getUploadService = () => {
  const cos = new cossdk({
    /*
    SecretId: tmpSecretId,
    SecretKey: tmpSecretKey,
    SecurityToken: sessionToken,
    StartTime: startTime,
    ExpiredTime: expiredTime,
    */
    SliceSize: 3145728,
    getAuthorization: async function (options, callback) {
      try {
        const {
          credentials: { sessionToken, tmpSecretId, tmpSecretKey },
          startTime,
          // todo 完善这里的类型控制
          expiredTime } = await getCOSAuth(undefined)
        callback({
          TmpSecretId: tmpSecretId,
          TmpSecretKey: tmpSecretKey,
          SecurityToken: sessionToken,
          // 建议返回服务器时间作为签名的开始时间，避免客户端本地时间偏差过大导致签名错误
          StartTime: startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000000
          ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用
        });
      } catch (e) {
        throw e
      }
    }
  })

  return cos
}

const RichText = forwardRef<RichTextRef, RichTextProps>((props, ref) => {
  const { docContent, mode, isLoading = false, onAutoSave, autoSaveDelay = 3000 } = props
  const cosInsRef = useRef<any>(undefined)
  const editorRef = useRef<any>()
  const titleAreaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState<string>('')
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 上次成功保存的快照（title+content），用于变更去重
  const lastSavedRef = useRef<string>('')
  // 最新 title / mode 的镜像，供编辑器回调闭包读取
  const titleRef = useRef<string>('')
  const modeRef = useRef<"view" | "edit">(mode)
  modeRef.current = mode
  // 自动保存状态（由 RichText 控制 AutoSaveIndicator，完全受控）
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>("idle")
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  // left-space 传送门目标节点
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useImperativeHandle(ref, () => {
    return {
      getInfo: () => ({ title, content: editorRef.current?.getDocument('text/lake') || '' })
    }
  })
  useEffect(() => {
   new Promise<void>((res) => {
    if(!window.Doc) {
      const script  = document.createElement('script')
      script.src = yuqueAddress.address
      script.onload = () => {
        res()
      }
      document.body.appendChild(script)
    } else{
      res()
    }
   }).then((v) => {

    
    const { title = '', content = '' } = docContent || {}
    setTitle(title)
    titleRef.current = title
    // 初始内容视为已保存快照
    lastSavedRef.current = JSON.stringify({ title, content })
    switch (mode) {
      case "edit":
        cosInsRef.current = getUploadService()
        return initEditMode({ title, content });
      case "view":
        return initViewMode({ title, content });
    }
   }).catch(e => {
    console.error("Failed to initialize RichText", e)
  })
  }, [mode, docContent])

  // 添加键盘快捷键监听（Ctrl+S / Command+S 触发自动保存）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        runAutoSaveRef.current();
      }
    };

    // 监听全局键盘事件
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [])

  const handleChangeTitle = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTitle(value)
    titleRef.current = value
    // 标题变更同样重置自动保存定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      runAutoSaveRef.current()
    }, autoSaveDelay)
  }, [autoSaveDelay])

  /** 执行自动保存：变更去重 → 保存中 → 调用使用方方法 → 记录保存时间 */
  const runAutoSave = useCallback(async () => {
    if (!onAutoSave || modeRef.current !== "edit") return
    const content = editorRef.current?.getDocument('text/lake') || ''
    const snapshot = JSON.stringify({ title: titleRef.current, content })
    if (snapshot === lastSavedRef.current) return // 无变更不触发
    setSaveStatus("saving")
    try {
      await onAutoSave(titleRef.current, content)
      // 成功后更新快照；失败保留旧快照以便重试
      lastSavedRef.current = snapshot
      setSavedAt(formatTime(new Date()))
      setSaveStatus("saved")
    } catch (e) {
      setSaveStatus("idle")
      message.error("自动保存失败")
    }
  }, [onAutoSave])
  // 编辑器回调闭包始终调用最新版本
  const runAutoSaveRef = useRef(runAutoSave)
  runAutoSaveRef.current = runAutoSave

  const initEditMode = useCallback((value: { title: string, content: string }) => {
    const { createOpenEditor } = window.Doc as any;
    const { title = '', content = '' } = value
    // 创建编辑器
    const editor = createOpenEditor(document.getElementById('rich-text-dom'), {
      input: {},
      toc: {
        enable: true,
      },
      header: <div className="lake-title-editor">
        <div className="title-input-container">
          <TextAreaAutoResize
            placeholder="请输入标题"
            defaultValue={title}
            ref={titleAreaRef}
            onChange={handleChangeTitle} />
        </div>
      </div>,
      image: {
        isCaptureImageURL() {
          return false;
        },
        // 配置上传接口,要返回一个promise对象
        createUploadPromise: (request: any) => {
          const { type, data } = request;
          if (type === 'url') {
            // data 是一个url，表示需要转存
            message.warning("暂时处理不了url")
            return Promise.reject(new Error("处理不了url图片"))
          } else if (type === 'file') {
            // data是一个File
            const { name: filename, size } = data
            return new Promise<{ url: string, size: number, filename: string }>((res, rej) => {
              getFileCosKey(filename).then((v) => {
                const { cosKey } = v
                if (!cosInsRef.current) {
                  message.warning("上传组件还在准备中")
                  return rej()
                }
                const cosIns = cosInsRef.current as any
                (cosIns as any).uploadFile({
                  Bucket: "wangjiarui1995-1257100122",
                  Region: "ap-beijing",
                  Key: cosKey,
                  Body: data, // 要上传的文件对象。
                  onProgress: function (progressData: any) {
                    console.log('上传进度：', progressData);
                  }
                }, function (err: any, data: any) {
                  console.log('上传结束', err || data);
                  if (err) {
                    rej(err);
                  } else {
                    let { Location, Key } = data
                    console.log("上传成功，文件地址：", Location, Key)
                    // res(data);
                    Location = Location.replace(/\S+?(?=\/)/, "assets.john-blog.top")
                    res({
                      url: `https://${Location}`,
                      size,
                      filename
                      // size: s
                    })
                  }
                });
              })
                .catch(e => {
                  message.error("获取文件戳失败")
                  rej(e)
                })
            })
          }
        },
      },
    });
    // 设置内容（异步设置，解决大纲不显示的问题）
    setTimeout(() => {
      editor.setDocument('text/lake', content);
    }, 0);
    // 监听内容变动：重置自动保存定时器，无变更 autoSaveDelay 后触发
    editor.on('contentchange', () => {
      console.info(editor.getDocument('text/lake'));

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        runAutoSaveRef.current()
      }, autoSaveDelay);
    });
    // @ts-ignore
    window.editor = editor
    editorRef.current = editor
  }, [autoSaveDelay])
  
  const initViewMode = useCallback((value: { title: string, content: string }) => {
    const { createOpenViewer } = window.Doc
    const { title = '', content = '' } = value
    const viewer = createOpenViewer(document.getElementById('rich-text-dom'), {
      header: <div className="lake-title-editor">
        <div className="title-input-container">
          <TextAreaAutoResize
            placeholder="请输入标题"
            value={title}
            ref={titleAreaRef}
            contentEditable={false}
          />
        </div>
      </div>,
      toc: {
        enable: true,
        allowModifyHash: true
      },
      image: {
        onClick: (imageInfo: any) => {
          console.log('图片被点击', imageInfo);
          // 这里可以处理图片点击事件，比如预览大图等
        }
      }
    })
    viewer.setDocument('text/lake', content)
  }, [])

  // 挂载后查找 left-space 传送门目标节点；卸载时清理定时器
  useEffect(() => {
    setPortalTarget(document.getElementById("left-space"))
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }
  }, [])

  return <>
    {/* 自动保存状态指示器：仅编辑模式下传送门渲染到 layout 的 left-space 节点 */}
    {portalTarget && mode === "edit" ? createPortal(
      <AutoSaveIndicator
        status={saveStatus}
        savedAt={savedAt}
        autoSaveEnabled={autoSaveEnabled}
      />,
      portalTarget
    ) : null}
    <Spin
      wrapperClassName="rich-text-spinning"
      style={{ height: "100%" }}
      tip="加载中..."
      spinning={isLoading}>
      <div className={`rich-text-container ${mode === "view" ? "view-mode" : "edit-mode"}`}>
        {mode === "view" && <div className="header-wrapper">{title}</div>}
        <div
          id="rich-text-dom"
          onBlur={(e) => {
            // 焦点移出整个编辑器区域时立即触发自动保存
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            if (autoSaveTimerRef.current) {
              clearTimeout(autoSaveTimerRef.current)
            }
            runAutoSaveRef.current()
          }}
        />
        <div></div>
      </div>
    </Spin>
  </>
})

export default RichText