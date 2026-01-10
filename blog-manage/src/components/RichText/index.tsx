import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle} from "react"
import { getFileCosKey, getCOSAuth } from "@/requests/service"
import TextAreaAutoResize from "react-textarea-autosize"
import { message, Spin } from "antd"
import cossdk from "cos-js-sdk-v5"
import './index.less'

type RichTextProps = {
  mode: "view" | "edit",
  isLoading?: boolean,
  docContent?: {
    title: string,
    content: string,
    updateTime: Date,
    createTime: Date,
  }
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
  const { docContent, mode, isLoading = false } = props
  const cosInsRef = useRef<any>(undefined)
  const editorRef = useRef<any>()
  const titleAreaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState<string>('')
  useImperativeHandle(ref, () => {
    return {
      getInfo: () => ({ title, content: editorRef.current?.getDocument('text/lake') || '' })
    }
  })
  useEffect(() => {
    switch (mode) {
      case "edit":
        cosInsRef.current = getUploadService()
        const { title = '', content = '' } = docContent || {}
        return initEditMode({ title, content });
      case "view":
        return initViewMode();
    }
  }, [mode, docContent])
  const handleChangeTitle = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
  }, [])

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
            onChange={handleChangeTitle}/>
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
                    const { Location, Key } = data
                    // res(data);
                    res({
                      url: `http://${Location}`,
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
    // 设置内容
    editor.setDocument('text/lake', content);
    // 监听内容变动
    editor.on('contentchange', () => {
      console.info(editor.getDocument('text/lake'));
    });
    // @ts-ignore
    window.editor = editor
    editorRef.current = editor
    
  }, [])
  const initViewMode = useCallback(() => {

  }, [])

  return <Spin
    wrapperClassName="rich-text-spinning"
    style={{height: "100%"}}
    tip="加载中..."
    spinning={isLoading}>
    <div id="rich-text-dom" />
  </Spin>
})

export default RichText