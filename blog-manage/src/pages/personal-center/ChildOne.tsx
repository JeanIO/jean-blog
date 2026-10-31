import React from "react"
export default class ChildOne extends React.Component<{ num: number }> {
  state = {
    num: 0
  }
  UNSAFE_componentWillMount() {

  }
  getSuber = () => {
    console.log("getSuber", this.props.num)
  }
  render() {
    return (
      <div>
        <h2>ChildOne Component</h2>
        <p>Received num: {this.props.num}</p>
      </div>
    )
  }
}