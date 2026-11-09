// function compose (middleware) {
//   if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
//   for (const fn of middleware) {
//     if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
//   }

// const { ExceptionMap } = require("antd/es/result")

//   /**
//    * @param {Object} context
//    * @return {Promise}
//    * @api public
//    */

//   return function (next) {
//     // last called middleware #
//     let index = -1
//     return dispatch(0)
//     function dispatch (i) {
//       if (i <= index) {
//         console.error("Error Index:" + index + 'Error I' + i)
//         return Promise.reject(new Error('next() called multiple times'))
//       }
//       console.log("index:" + index)
//       index = i
//       let fn = middleware[i]
//       if (i === middleware.length) fn = next
//       if (!fn) return Promise.resolve()
//       try {
//         return Promise.resolve(fn(dispatch.bind(null, i + 1)));
//       } catch (err) {
//         return Promise.reject(err)
//       }
//     }
//   }
// }


// function fun1(next) {
//   console.log("fun1")
//   next()
//   // next()
// }
// function fun2(next) {
//   console.log("fun2")
//   next()

// }
// function fun3(next) {
//   console.log("fun3")
//   next()
//   next()


// }
// function fun4(next) {
//   console.log("fun4")
//   next()

// }
// function fun5(next) {
//   console.log("fun5")
//   next()

// }


// const middlewares = [fun1, fun2, fun3, fun4, fun5]

// const allFN = compose1(middlewares)
// allFN().then(() => {
//   console.log("全部执行完毕")
// }).catch(e => {
//   console.log("执行出错", e)
// })




// function compose1(middlewares) {
//   if(!Array.isArray(middlewares)) throw new Error("middleware 必须是数组类型")
//   for(let i =0; i < middlewares.length; i++) {
//     if(typeof middlewares[i] != 'function') throw new Error("必须全是方法")
//   }

//   return function(lastOne) {
//     let index = -1
//     return dispatch(0)
//     function dispatch(i) {
//       if(i <= index) throw Promise.reject("不可以重复调用next哦！")
//       index = i
//       let fn = middlewares[i]
//       if(i === middlewares.length) fn = lastOne
//       if(!fn) return Promise.resolve()

//       try {
//         return Promise.resolve(fn(dispatch.bind(null, i + 1)))
//       } catch(e) {
//         return Promise.reject(e)
//       }
//     }
//   }
// }



// function compose3(middlewares) {
//   if(!Array.isArray(middlewares)) throw new Error("middleware必须是数组类型")
//   for(let i = 0 ; i < middlewares.length; i++) {
//     if(typeof middlewares[i] != "function") {
//       throw new Error("只能是方法")
//     }
//   }


//   return function(lastOne){
//     let index = -1
//     return dispatch(0)
//     function dispatch(i) {
//       if(i <= index) return Promise.reject(new Error("多次调用了next"))
//       index = i
//       let fn = middlewares[i]
//       if(i === middlewares.length) fn = lastOne
//       if(!fn) return Promise.resolve() // ?
//       try {
//         return Promise.resolve(fn(dispatch.bind(null, i+1)))
//       }catch(e) {
//         return Promise.reject(e)
//       }
//     }
//   }
// }

// const p1 = new Promise((res, rej) => {
//   res("111")
//   rej(new Error("p1 Error")) 
// })

// p1.then(res  => {
//   console.log("p1-1-then")
// }).then((res) => {
//   console.log("p1-2-then")
// }).catch(e => {
//   console.log("p1-1-catch")
// })

// const p2 = new Promise((res, rej) => {
//   res("bilibili")
// })

// p2.then(res=> {
//   console.log('p2-1-then', res)
// }).then(res => {
//   console.log('p2-2-then', this)
// })


// const p1 = new Promise((res, rej) => {
//   res("eee") 
// })
// p1.then(value => {
//   console.log("p1-1-then")
// }).then(v => {
//   setTimeout(() => {
//     console.log("p1-2-then")
//   }, 0)
// })

// setTimeout(() => {
//   console.log("global setTime1")
// }, 0)

// setTimeout(() => {
//   console.log("global setTime2")
// }, 0)

// setTimeout(() => {
//   console.log("global setTime3")
// }, 0)

// 判断是否为函数
function isFunction(fn) {
  return typeof fn === 'function';
}

// 判断是否为对象或函数
function isObject(obj) {
  return obj !== null && (typeof obj === 'object' || typeof obj === 'function');
}

// 解决过程（Promise Resolution Procedure）
function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1 如果 promise2 和 x 指向同一对象，以 TypeError 为据因拒绝 promise
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called = false;

  // 2.3.3 如果 x 是对象或函数
  if (isObject(x)) {
    try {
      // 2.3.3.1 把 x.then 赋值给 then
      const then = x.then;

      // 2.3.3.3 如果 then 是函数
      if (isFunction(then)) {
        // 2.3.3.3.1 执行 then.call(x, resolvePromiseFn, rejectPromiseFn)
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 2.3.3.4 如果 then 不是函数，则以 x 为参数 fulfill promise
        resolve(x);
      }
    } catch (e) {
      // 2.3.3.2 或 2.3.3.3.4.1 捕获异常
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 2.3.4 x 不为对象或函数，以 x 为参数 fulfill promise
    resolve(x);
  }
}

class MyPromise {
  constructor(executor) {
    this.state = 'pending'; // 状态: pending | fulfilled | rejected
    this.value = undefined; // 成功的值
    this.reason = undefined; // 失败的原因

    // 存储成功/失败回调（支持多个 then）
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 异步执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // 异步执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // 2.2.1 可选参数处理
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value;
    onRejected = isFunction(onRejected)
      ? onRejected
      : reason => { throw reason; };

    // 2.2.7 then 必须返回一个新的 promise
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        // 2.2.4 onFulfilled/onRejected 必须在 execution context stack 清空后调用（异步）
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === 'rejected') {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === 'pending') {
        // 收集回调，等状态变更后再执行
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }

  // 静态方法：Promise.resolve
  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  // 静态方法：Promise.reject
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  // catch 方法
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

// 兼容不支持 queueMicrotask 的环境（如老浏览器）
// if (typeof queueMicrotask === 'undefined') {
//   window.queueMicrotask = (cb) => {
//     Promise.resolve().then(cb);
//   };
// }

const myP1 = new MyPromise((res, rej) => {
  setTimeout(() => {
    rej("1")
  }, 1000)
})

myP1
.catch(e =>{
  console.log("完蛋", e)
  return "aaa"
})
.then((v) => {
  return MyPromise.reject(new Error("nanan"))
}).then(v => {
  console.log(v)
  return "3"
}).then(v => {
  console.log(v)
}).catch(e => {
  console.log(e)
})

myP1.then(v => {
  console.log("第二次读取myp1的值", v)
})

myP1.then(v => {
  console.log("第三次读取myp1的值", v)
})
// p2.catch((e) => {
//   console.log(e)
//   return "666"
// }).then(v => {
//   console.log("p2-then", v)
// })


// const prom = new Promise((res, rej)=> {
//   setTimeout(() => {
//     res("ccc ")
//   }, 1000)
// })

// prom.then(v => {
//   console.log("第一次读取prom的值", v)

// }).catch(e => {
//   console.log("出错啦")
// }).then(v => {
//   console.log("第四次吧应该")
// }).then(v => {
//   console.log("第五次吧应该")
// })

// prom.then(v => {
//   console.log("第二次读取prom的值", v)
// })

// prom.then(v => {
//   console.log("第三次读取prom的值", v)
// })

const readline = require('readline');
// console.log(process.version)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', function (str) {

    // const tokens = line.split(' ');
    // console.log(parseInt(tokens[0]) + parseInt(tokens[1]));
    const arr = str.matchAll(/[A-Z][a-z]*/g)
    let result = ""
    arr.forEach(function(item) {
        result = item[0]
    })
    console.log(result)
    
});