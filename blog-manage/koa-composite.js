function composite(middleware) {
  if (!Array.isArray(middleware)) {
    throw new Error("必须是数组")
  }
  for (fn of middleware) {
    if (typeof fn !== "function") {
      throw new Error("每个参数必须是方法")
    }
  }
  let index = -1 // 这里为什么是-1
  return function (lastOne) {
    let i = 0
    if (index > i) return Promise.reject("不能重复调用next")
    index = i
    return dispatch(0)
    function dispatch(i) {
      let fn = middleware[i]
      if (i === middlewares.length) fn = lastOne
      if (!fn) {
        return Promise.resolve()
      }
      try {
        const x = fn.call(null, dispatch.bind(null, i + 1))
        return Promise.resolve(x)
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}


function fun1(next) {
  console.log("fun1")
  next()
  // next()
}
function fun2(next) {
  console.log("fun2")
  next()

}
function fun3(next) {
  console.log("fun3")
  next().then((value) => {
    console.log(value)
  })
}

function fun4(next) {
  console.log("fun4")
  next()
  return 123123
}
function fun5(next) {
  console.log("fun5")
  next()
}
const middlewares = [fun1, fun2, fun3, fun4, fun5]
// const allFun = composite(middlewares)
// allFun().then(() => {
//   console.log("全部执行完毕")
// })


function compose1(middlewares) {
  if (!Array.isArray(middlewares)) {
    throw new Error("这里有问题")
  }
  for (fn of middlewares) {
    if (typeof fn !== "function") throw new Error("每个都得是方法")
  }

  return function (lastOne) {
    let index = -1
    return dispatch(0)
    function dispatch(i) {
      if (i < index) return Promise.reject(new Error("不能重复调用next"))
      let fn = middlewares[i]
      index = i
      if (i === middlewares.length)
        fn = lastOne
      if (typeof fn !== "function")
        return Promise.resolve()
      try {
        return Promise.resolve(fn(dispatch.bind(null, i + 1)))
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}

const runAsync = (fn) => {
  if (!isFunction(fn)) {
    throw new Error("参数必须为function")
  }
  if (queueMicrotask) {
    queueMicrotask(fn)
  } else if (MutationObserver) {
    const div = document.createElement('div')
    const mutation = new MutationObserver(() => {
      fn()
      mutation.disconnect()
    })
    mutation.observe(div, { attributes: true })
    div.dir = "ltr"
  } else {
    setTimeout(() => {
      fn()
    }, 0)
  }
}

const isFunction = (fun) => {
  return typeof fun === "function"
}

const isMyPromise = (prom) => {
  return prom instanceof MyPromise
}

const resolvePromise = (promise2, x, resolve, reject) => {
  if(promise2 === x) {
    return reject(new Error("不能重复引用"))
  }
  let called = false
  if(isMyPromise(x)) {
    return x.then.call(x, (u) => {
      if(!called) {
        called = true
        resolve(u)
      }
    }, v => {
      if(!called) {
        called = true
        reject(v)
      }
    })
  }
  resolve(x)
}

class MyPromise {
  static resolve(v) {
    return new MyPromise((res) => res(v))
  }
  static reject(e) {
    return new MyPromise((_, rej) => rej(e))
  }
  constructor(executor) {
    this.value;
    this.status = "PENDING"
    this.onResolveList = []
    this.onRejectList = []
    let resolve = (v) => {
      if (this.status === "PENDING") {
        this.status = "FULFILLED"
        this.value = v
        this.onResolveList.forEach((fn) => fn(this.value))
      }
    }
    let reject = (v) => {
      if (this.status === "PENDING") {
        this.status = "REJECTED"
        this.value = v
        this.onRejectList.forEach((fn) => fn(this.value))
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    const onFulFun = isFunction(onFulfilled) ? onFulfilled : (v) => v;
    const onRejFun = isFunction(onRejected) ? onRejected : (e) => { throw e };

    const promise2 = new Promise((resolve, reject) => {
      const wrapFun = (fun) => {
        return () => {
          try {
            const x = fun(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }
      }
      if (this.status === "PENDING") {
        this.onResolveList.push(() => {
          runAsync(wrapFun(onFulFun))
        })
        this.onRejectList.push(() => {
          runAsync(wrapFun(onRejFun))
        })
      } else if (this.status === "FULFILLED") {
        runAsync(wrapFun(onFulFun))
      } else {
        runAsync(wrapFun(onRejFun))
      }
    })
    return promise2
  }
  catch(onRejected) {
    if (!isFunction(onRejected)) {
      throw new Error("onRejected必须为function")
    }
    return this.then(undefined, onRejected)
  }
}

const myP1 = new MyPromise((res, rej) => {
  setTimeout(() => {
    res("1")
  }, 1000)
})

myP1
.catch(e =>{
  console.log("完蛋", e)
  return "aaa"
})
.then((v) => {
  console.log("cvcv", v)
  return MyPromise.reject(new Error("nanan"))
}).then(v => {
  console.log(v)
  return "3"
}).then(v => {
  console.log(v)
}).catch(e => {
  console.log(e)
})
