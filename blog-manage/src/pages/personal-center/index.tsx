import { useEffect, useState } from "react"
import { Button } from "antd"
import ChildOne from "./ChildOne"
export default function PersonalCenter() {
  const [value1, setValue1] = useState<number>(1)
  return (
    <div>
      { value1 } <Button onClick={() => setValue1(value1 + 1)}>增加</Button>  <ChildOne num={value1} />
      <h1>个人中心</h1>
      <p>这里是个人中心页面的内容。</p>
    </div>
  )
}