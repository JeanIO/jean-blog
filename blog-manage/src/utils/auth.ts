// session-cookie 模式下，sessionId 存在 httpOnly cookie 里，JS 读不到
// 这里只维护一个"已登录"标记用于前端路由判断；
// 真正的登录态由后端 session 校验，接口返回 401 时会自动清标记并踢回登录页
const LOGIN_KEY = "blog-admin-login"

export const markLogin = (): void => localStorage.setItem(LOGIN_KEY, "1")

export const clearLogin = (): void => localStorage.removeItem(LOGIN_KEY)

export const isLogin = (): boolean => !!localStorage.getItem(LOGIN_KEY)
