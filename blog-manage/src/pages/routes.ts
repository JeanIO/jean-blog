// import DefaultPage from "./DefaultPage"

import { Children, Component } from "react"

// import BlogManage from "./blog-manager"
const routes = [
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
  { path: "/*", redirect: '/dashboard' },
]
export default routes
