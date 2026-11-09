// 全局 axios 请求单例（与 blog-manage 的 request.ts 同构）：
// C 端接口不需要登录态，因此错误处理里没有 401 清标记/跳转逻辑，只做统一提示
import axios from "axios"
import { ElMessage } from "element-plus"

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const request = axios.create({
  baseURL: "/api",
})

request.interceptors.response.use(
  (res) => {
    // axios 默认只把 2xx 视为成功，走到这里说明请求成功，直接返回后端信封
    return Promise.resolve(res.data)
  },
  (error) => {
    // 4xx/5xx 会被 axios reject 到这里，状态码和响应体在 error.response 里
    const status = error?.response?.status
    const msg = error?.response?.data?.message
    if (status >= 500) {
      ElMessage.error(msg || "服务器开小差了，请稍后重试")
    } else if (status >= 400) {
      ElMessage.error(msg || "请求失败")
    }
    return Promise.reject(error)
  },
)

export default request
