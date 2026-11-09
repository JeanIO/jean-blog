// src/app.tsx
import React, { useEffect } from 'react';
import './global.less';
import { Provider } from 'react-redux';
import { ConfigProvider } from "antd"
import store from "@/store"
import zhCN from 'antd/es/locale/zh_CN';
// @ts-ignore
export const rootContainer = (root) => {

  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
      {root}
      </ConfigProvider>
    </Provider>
  ) 
};