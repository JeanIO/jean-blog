
import { builtinModules as builtin } from 'node:module';
// const value = import('./async-module.js');
// value.then((res) => {
//     console.log(res.default);
// })
builtin.forEach((module) => {
    console.log(module);
})