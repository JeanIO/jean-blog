import { AsyncLocalStorage } from "node:async_hooks";
// 情况一：在主模块中调用setTimeout和setImmediate

/*
console.log('=== 情况一：主模块中调用 ===');
setImmediate(() => {
    console.log('setImmediate被执行');
});
setTimeout(() => {
    console.log('setTimeout被执行');
}, 0);

new Promise((res) => {
  console.log('Promise被执行');
  res();
}).then(() => {
    console.log('Promise的then被执行');
});

// 情况二：在I/O回调中调用setTimeout和setImmediate
const fs = require('fs');
console.log('\n=== 情况二：I/O回调中调用 ===');
fs.readFile(__filename, () => {
    setImmediate(() => {
        console.log('I/O回调中的setImmediate被执行');
    });
    setTimeout(() => {
        console.log('I/O回调中的setTimeout被执行');
    }, 0);
});

*/


// asynchronous 练习
console.log('\n=== asynchronous 练习 ==='); 
const asynch = new AsyncLocalStorage();
var count = 0;
const traceId = "123456";
Promise.resolve().then(() => {
    console.log(`Promise${++count}的then被执行`);
    asynch.run({ traceId }, () => {
        const { traceId } = asynch.getStore();
        console.log(`Promise${count}${traceId}的then中的异步操作被执行`);
    });
    return count
}).then((count) => {
    console.log(`Promise${++count}的then被执行`);
    const { traceId } = asynch.getStore();
    console.log(`${traceId}Promise${count}的then中的异步操作被执行`);
})