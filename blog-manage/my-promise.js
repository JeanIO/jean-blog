
// const isFunction = (fn) => {
//   return (typeof fn === "function")
// }

// const isMyPromise = (arg) => {
//   return arg instanceof MyPromise
// }

// const runAsync = (fun) => {
//   if (typeof fun !== "function") {
//     throw new Error("这里只能传输方法", fun)
//   }
//   if (queueMicrotask) {
//     queueMicrotask(fun)
//   } else if (MutationObserver) {
//     const div = document.createElement("div")
//     const mutation = new MutationObserver(() => {
//       fun()
//       div = null
//       mutation.disconnect()
//     })
//     mutation.observe(div, { attributes: true })
//     div.dir = "ltr"
//     div = null
//   } else {
//     setTimeout(() => {
//       fun()
//     }, 0)
//   }
// }

// const resolvePromise = (promise2, x, resolve, reject) => {
//   if (promise2 === x) {
//     return reject(new Error("不行， 不能循环引用"))
//   }
//   let called = false
//   if (isMyPromise(x)) {
//     return x.then.call(x, (u) => {
//       if (!called) {
//         called = true
//         resolve(u)
//       }
//     }, (v) => {
//       if (!called) {
//         called = true
//         reject(v)
//       }
//     })
//   } else {
//     resolve(x)
//   }
// }

// let index = 0
// let promiseList = []
// class MyPromise {
//   static resolve(v) {
//     return new MyPromise(res => res(v))
//   }
//   static reject(e) {
//     return new MyPromise((_, rej) => { rej(e) })
//   }
//   constructor(executor) {
//     this.value = undefined
//     this.state = "PENDING"
//     this.number = index++
//     this.resolveCallbackList = []
//     this.rejectCallbackList = []
//     let resolve = (value) => {
//       if (this.state === "PENDING") {
//         this.value = value
//         this.state = "FULFILLED"
//         this.resolveCallbackList.forEach(fn => fn(this.value))
//       }
//     }
//     let reject = (value) => {
//       if (this.state === "PENDING") {
//         this.value = value
//         this.state = "REJECTED"
//         this.rejectCallbackList.forEach(fn => fn(this.value))
//       }
//     }
//     try {
//       executor(resolve, reject)
//     } catch (e) {
//       reject(e)
//     }
//     promiseList.push(this)
//   }

//   then(onFulfilled, onRejected) {
//     const onFulFun = isFunction(onFulfilled) ? onFulfilled : (res) => res
//     const onRejFun = isFunction(onRejected) ? onRejected : (e) => { throw e }
//     const promise2 = new MyPromise((res, rej) => {
//       if (this.state === "REJECTED") {
//         runAsync(() => {
//           try {
//             const x = onRejFun(this.value)
//             resolvePromise(promise2, x, res, rej)
//           } catch (e) {
//             rej(e)
//           }
//         })
//       } else if (this.state == "FULFILLED") {
//         runAsync(() => {
//           try {
//             const x = onFulFun(this.value)
//             resolvePromise(promise2, x, res, rej)
//           } catch (e) {
//             rej(e)
//           }
//         })
//       } else {
//         this.rejectCallbackList.push((v) => {
//           runAsync(() => {
//             try {
//               const x = onRejFun(v)
//               resolvePromise(promise2, x, res, rej)
//             } catch (e) {
//               rej(e)
//             }
//           })
//         })
//         this.resolveCallbackList.push(v => {
//           runAsync(() => {
//             try {
//               const x = onFulFun(v)
//               resolvePromise(promise2, x, res, rej)
//             } catch (e) {
//               rej(e)
//             }
//           })
//         })
//       }
//     })
//     return promise2
//   }
//   catch(fun) {
//     const onRejFn = isFunction(fun) ? fun : (e) => { throw e }
//     return this.then(undefined, onRejFn)
//   }
// }


// const prom = new MyPromise((res, rej) => {
//   res("herhe")
// })


// prom.then(v => {
//   console.log("链式调用1", v)
//   return v
// })
//   .then(v => {
//     console.log("链式调用2", v)
//     return MyPromise.resolve("链2")
//   }).then(v => {
//     console.log("链式调用3", v)
//     return MyPromise.reject(new Error("sddd"))
//   }).then(v => {
//     console.log("链式调用4", v)
//     return v
//   }).then(v => {
//     console.log("链式调用5", v)
//     return v
//   }).catch(e => {
//     console.log("难道出错了？", e)
//   })



console.log("start")
var prom1 = new Promise((res) => {
  console.log("Promising")
  res("1")
})
prom1.then((v) => {
  console.log(v)
  return "1"
}).then(v => {
  console.log(v)
})

Promise.resolve().then(() => {
  console.log("success")
})

Promise.reject(new Error("err")).then(() => {
  console.log("err then")
}).catch(e => {
  console.log(e.message)
})

console.log("end")
