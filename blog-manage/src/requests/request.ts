import axios from "axios"
import { message } from "antd"
import { clearLogin } from "@/utils/auth"
import { history } from "umi"

export interface ApiResponse<T> {
  code: number,
  data: T,
  message: string
}

const request = axios.create({
  baseURL: '/api'
})

request.interceptors.response.use(
  (res) => {
    // axios 默认只把 2xx 视为成功，走到这里说明请求成功，直接返回响应体
    return Promise.resolve(res.data)
  },
  (error) => {
    // 4xx/5xx 会被 axios reject 到这里，状态码和响应体在 error.response 里
    const status = error?.response?.status
    const msg = error?.response?.data?.message
    // 统一错误逻辑：4xx 业务错误提示后端 message；5xx 提示服务器错误
    if (status === 401) {
      // session 失效：清登录标记踢回登录页（登录页自身的 401 不跳转，只提示）
      message.error(msg || "未登录或登录已过期")
      clearLogin()
      if (window.location.pathname !== "/login") {
        const prevLocation = window.location.href
        history.push(`/login?url=${encodeURIComponent(prevLocation)}`)
      }
    } else if (status >= 500) {
      message.error(msg || "服务器错误，请报告给大帅比--John")
    } else if (status >= 400) {
      message.error(msg || "请求失败")
    }
    return Promise.reject(error)
  }
)



export function addResponseParser<ArgT, DataT>(
  fun: (args: ArgT) => Promise<ApiResponse<DataT>>
) {
  return function(args: ArgT): Promise<DataT> {
    return fun(args).then((response) => {
      const { code, data } = response;
      switch (code) {
        case 200:
        case 201:
        case 204:
          return data; // 
        default:
          throw response; // 保留原始响应用于错误处理
      }
    });
  };
}
export default request