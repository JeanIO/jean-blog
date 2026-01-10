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
    case 500:
      message.error("服务器错误，请报告给大帅比--John")
      return Promise.reject(data)
    default:
      return Promise.resolve(res)
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