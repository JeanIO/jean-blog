import React, { useEffect, memo } from "react"
// class ChildOne extends React.Component {
//   componentDidMount() {
//     console.log("ChildOne componentDidMount")
//   }
//   render() {
//     return (
//       <div>
//         <h1>Child One</h1>
//       </div>
//     )
//   }
// }

const ChildOne: React.FC<{ num: number }> = memo(({ num }) => {
  useEffect(() => {
    console.log("ChildOne useEffect")
  }, [])
  console.log("ChildOne render")
  return (
    <div>

      <p>Child Number: {num}</p>
    </div>
  )
})

export default ChildOne