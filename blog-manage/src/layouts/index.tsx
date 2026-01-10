import Slot from "./layout"
import { ConfigProvider } from "antd"
import { Provider } from "react-redux"
import store from "@/store"
import zhCN from 'antd/es/locale/zh_CN';
import './index.less'


// ConfigProvider.config({
//   prefixCls:"ant_light",
//   theme: {
//     primaryColor:'#25b864'
//   }
// })

export default function RootPage() {
  
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Slot></Slot>
      </ConfigProvider>
    </Provider>
  )
}