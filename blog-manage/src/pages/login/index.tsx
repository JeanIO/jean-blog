import { Button, Card, Form, Input, message } from "antd"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { useCallback, useState } from "react"
import { useNavigate, useLocation } from "umi"
import { login } from "@/requests/auth"
import { markLogin } from "@/utils/auth"
import "./index.less"

type LoginForm = {
  username: string,
  password: string,
}

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  // 解析登录页 URL 中的 url 参数（401 时被踢回登录页带上的原页面地址），登录成功后跳回该页面
  const getRedirectTarget = useCallback((): string => {
    const target = new URLSearchParams(location.search).get("url")
    if (!target) return "/dashboard"
    try {
      const url = new URL(target, window.location.origin)
      // 只允许跳回站内页面，且避免跳回登录页造成死循环
      if (url.origin === window.location.origin && url.pathname !== "/login") {
        return url.pathname + url.search + url.hash
      }
    } catch {
      if (target.startsWith("/") && target !== "/login") return target
    }
    return "/dashboard"
  }, [location.search])

  const onFinish = useCallback(async (values: LoginForm) => {
    setLoading(true)
    try {
      const res = await login(values)
      // session 已由后端 Set-Cookie 下发，这里只做前端登录标记
      markLogin()
      message.success(`欢迎回来，${res.data.username}`)

      nav(getRedirectTarget(), { replace: true })
    } catch (e) {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [nav, getRedirectTarget])

  return <div className="login-page">
    <Card className="login-card" bordered={false}>
      <div className="login-title">
        <h1>博客管理后台</h1>
        <p>登录以继续管理你的内容</p>
      </div>
      <Form<LoginForm>
        name="login"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </Card>
  </div>
}
