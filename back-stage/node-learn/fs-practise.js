import * as fs from 'node:fs';
import readline from 'readline'

const assetsPath = './assets'

// // 创建readline接口用于用户输入
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// })

// // 读取assets目录下的所有文件
// fs.readdir(assetsPath, (err, files) => {
//   if (err) {
//     console.error('读取目录失败:', err)
//     rl.close()
//     return
//   }

//   // 过滤掉可能的子目录，只显示文件
//   const assetFiles = files.filter(file => {
//     try {
//       return fs.statSync(`${assetsPath}/${file}`).isFile()
//     } catch (err) {
//       return false
//     }
//   })

//   if (assetFiles.length === 0) {
//     console.log('assets目录下没有文件')
//     rl.close()
//     return
//   }

//   // 显示文件列表
//   console.log('assets目录下的文件:')
//   assetFiles.forEach((file, index) => {
//     console.log(`${index + 1}. ${file}`)
//   })

//   // 提示用户选择文件
//   rl.question('请输入要读取的文件序号: ', (answer) => {
//     const selectedIndex = parseInt(answer) - 1

//     if (selectedIndex >= 0 && selectedIndex < assetFiles.length) {
//       const selectedFile = assetFiles[selectedIndex]
//       const filePath = `${assetsPath}/${selectedFile}`

//       // 读取选择的文件
//       fs.readFile(filePath, (err, data) => {
//         if (err) {
//           console.error('读取文件失败:', err)
//         } else {
//           console.log(`\n=== ${selectedFile} 文件内容 ===`)
//           // 尝试以UTF-8格式显示，如果失败则显示十六进制
//           try {
//             console.log(data.toString('utf8'))
//           } catch (err) {
//             console.log('文件不是UTF-8格式，显示十六进制:', data.toString('hex'))
//           }
//         }
//         rl.close()
//       })
//     } else {
//       console.log('无效的选择序号')
//       rl.close()
//     }
//   })
// })
var count = 0
//fs-promise
fs.readFile('./event-loop.js', { encoding: 'utf8' }).then((res) => {
    console.log(res)
})
//fs-callback
// fs.readFile(`./event-loop.js`, (err, data) => {

//   if (err) {
//     console.error('读取文件失败:', err)
//   } else {
//     console.log(`\n=== event-loop.js文件内容 === ${count++}`)
//     // 尝试以UTF-8格式显示，如果失败则显示十六进制
//     try {
//       console.log(data.toString('utf8'))
//       fs.writeFile(`./event-loop-${count}.js`, data, (err) => {
//         if (err) {
//           console.error('写入文件失败:', err)
//         } else {
//           console.log(`event-loop-${count}.js文件写入成功`)
//         }
//       })
//     } catch (err) {
//       console.log('文件不是UTF-8格式，显示十六进制:', data.toString('hex'))
//     }
//   }
// })