import { IApi } from 'umi';

export default (api: IApi) => {
  // api.describe({
  //   key: 'changeFavicon',
  //   config: {
  //     schema(joi) {
  //       console.log("hehrehrehrhre")
  //       return joi.string();
  //     },
  //   },
  //   enableBy: api.EnableBy.config
  // });
  // api.modifyConfig((memo)=>{
  //   memo.favicons = "https://avatars.githubusercontent.com/u/23093076?v=4";
  //   return memo;
  // }); 

  const YUQUE_VERSION = "1.32.0"
  api.addHTMLLinks(() => ({ rel: "stylesheet", href: "https://unpkg.com/antd@4.24.13/dist/antd.css" }))
  api.addHTMLLinks(() => ({rel: "stylesheet" ,href: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${YUQUE_VERSION}/umd/doc.css` }));
  api.addHTMLHeadScripts(() => ("https://unpkg.com/react@18/umd/react.production.min.js"))
  api.addHTMLHeadScripts(() => ("https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"))
  api.addHTMLScripts(() => ({ src:`https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${YUQUE_VERSION}/umd/doc.umd.js` }))
};
