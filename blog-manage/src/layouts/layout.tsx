import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, matchRoutes } from 'umi';
import { Menu, Layout, Button, theme, Breadcrumb, Divider, message } from "antd";
import { ReadOutlined, MenuOutlined, DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout } from "@/requests/auth";
import { clearLogin } from "@/utils/auth";
const { Sider, Header, Content, Footer } = Layout

import routes from "@/pages/routes";

let routePathKey: any = {}

function getMenuItems(routes: any, parentPath = '/') {
  return routes.filter(item => {
    return !item.noMenuBread && !item.noMenu && !item.redirect
  })
    .map((item: any) => {

      let children
      let icon = null
      let currentPath = /^\/.*/.test(item.path) ? item.path : `${parentPath}/${item.path}`

      if (item.routes && Array.isArray(item.routes) && item.routes) {
        children = getMenuItems(item.routes, currentPath)
      } else {
        routePathKey[currentPath] = item.path
      }
      switch (item.path) {
        case "/dashboard":
          icon = <DashboardOutlined />
          break;
        case "/folders":
          icon = <ReadOutlined />
          break;
        case "/personal-center":
          icon = <UserOutlined />
        default:
          break;
      }
      return { label: item.label, key: item.path, icon, children }
    })
}

const MenuItems = getMenuItems(routes)

export default function LayoutComp() {
  const [collapsed, setCollapsed] = useState(false);
  const nav = useNavigate()

  const { pathname } = useLocation()
  const mapKey = matchRoutes(Object.keys(routePathKey).map(item => ({ path: item })), pathname)

  const highLightKey = mapKey ? mapKey[0].route.path : ""
  const onMenuSelect = useCallback((args: any) => {
    // console.log("sddsd", args)
    const path = args.keyPath.reverse().reduce((prev: any, current: string) => {
      if (/^\/.*/.test(current)) {
        return current
      }
      return `${prev}/${current}`
    }, '')
    nav(path)
  }, [])

  const onLogout = async () => {
    try {
      await logout()   // 后端销毁 session 并清除 cookie
    } catch (e) {
      // 失败提示由 request 拦截器统一处理，即使失败也照样清本地标记
    }
    clearLogin()
    message.success("已退出登录")
    nav("/login", { replace: true })
  }

  // logo 艺术字：描边逐笔绘制动画（对齐 client 首页 Jean's Blog 的效果）
  const logoTextRef = useRef<SVGTextElement>(null)
  const [drawn, setDrawn] = useState(false)
  const [dashLength, setDashLength] = useState(0)

  useLayoutEffect(() => {
    const text = logoTextRef.current
    if (!text) return
    setDashLength(text.getComputedTextLength())
    requestAnimationFrame(() => setDrawn(true))
  }, [])

  return (
    <Layout className="main-container">
      <Sider
        className="main-sider"
        collapsed={collapsed}
        theme="light"
        width={220}
        breakpoint="md"
        collapsible
        onCollapse={(collapsed, type) => {
          setCollapsed(collapsed)
        }}
      >
        <Link to="/dashboard" className={`logo-box${collapsed ? " logo-box--collapsed" : ""}`}>
          <span className="logo-j">J</span>
          <svg className="brand-svg" viewBox="0 0 200 64" role="img" aria-label="Jean's Blog">
            <defs>
              <linearGradient id="brand-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#40a9ff" />
                <stop offset="100%" stopColor="#1890ff" />
              </linearGradient>
            </defs>
            <text
              ref={logoTextRef}
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              className={`brand-text${drawn ? " brand-text--drawn" : ""}`}
              style={{
                strokeDasharray: `${dashLength}, ${dashLength}`,
                strokeDashoffset: drawn ? 0 : dashLength,
              }}
            >
              Jean's Blog
            </text>
          </svg>
        </Link>
        <Menu
          mode="inline"
          onSelect={onMenuSelect}
          selectedKeys={[highLightKey]}
          items={MenuItems}
        />
      </Sider>
      <Content
        className="main-content"
      >
      <Header style={{ padding: "0 9px" }}>
        <div className="left-box" id="leftBox"></div>
        <div className="right-box" id="rightBox">
          <Button danger icon={<LogoutOutlined />} onClick={onLogout}>退出登录</Button>
        </div>
      </Header>
        <div
          className="content-wrapper"
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}


