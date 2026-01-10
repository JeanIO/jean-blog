import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, matchRoutes } from 'umi';
import { Menu, Layout, Button, theme, Breadcrumb, Divider } from "antd";
import { ReadOutlined, MenuOutlined, DashboardOutlined } from '@ant-design/icons';
import { createFolder } from "@/requests/folder"
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
        case "/blog-manager":
          icon = <ReadOutlined />
          break;
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
        <div className="left-box" id="leftBox">Something here</div>
        <div className="right-box" id="rightBox"> Something her</div>
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


