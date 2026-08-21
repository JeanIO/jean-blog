import axios from "axios"
import { message } from "antd"

export interface ApiResponse<T> {
  code: number,
  data: T,
  message: string
}

const request = axios.create({
  baseURL: '/api'
})

request.interceptors.response.use((res) => {
  const { status, data = {} } = res
  switch(status) {
    case 200:
    case 201:
    case 204:
      return Promise.resolve(data)
    default: {
      // 统一错误逻辑：4xx 业务错误提示后端 message；5xx 提示服务器错误
      const msg = data?.message
      if (status >= 500) {
        message.error(msg || "服务器错误，请报告给大帅比--John")
      } else if (status >= 400) {
        message.error(msg || "请求失败")
      }
      return Promise.reject(data)
    }
  }
}, (error) => {
  return Promise.reject((error))
})



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