// import DefaultPage from "./DefaultPage"

import { Children, Component } from "react"

// import BlogManage from "./blog-manager"
const routes = [
  { path: "/login", component: "./login", layout: false, noMenu: true },
  { path: "/dashboard", label: "看板", component: "./default-page" },
  { path: "/folders", component: "./folder-manager", label: "知识库管理" },
  { path: "/folders/:folderId",
    component: "./blog-manager",
    routes: [
      { path: "home", component: "./blog-manager/home" },
      { path: ":blogId", component: "./blog-manager/EditManager" }
      // { path:"/:id", }
    ],
    noMenu: true,
    layout: false
  },
  {
    path:"/personal-center",
    component: "./personal-center",
    label: "个人中心"
  },
  { path: "/*", redirect: '/dashboard' },
]
export default routes
