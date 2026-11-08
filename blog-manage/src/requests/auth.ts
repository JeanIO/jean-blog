import req, { ApiResponse } from "./request"

export type LoginReq = {
  username: string,
  password: string,
}

export type LoginRes = {
  username: string,
}

// session 由后端 Set-Cookie 下发，浏览器自动携带，前端无需处理凭证
export const login = (data: LoginReq) => {
  return req.post<LoginRes, ApiResponse<LoginRes>>("/back-stage/login", data)
}

export const logout = () => {
  return req.post<void, ApiResponse<void>>("/back-stage/logout")
}
