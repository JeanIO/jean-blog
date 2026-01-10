# 关卡1：创建简单的HTTP服务器

## 目标
创建一个基本的HTTP服务器，能够响应客户端请求并返回简单的HTML内容。

## 知识点
- `http`模块的基本使用
- HTTP服务器的创建与监听
- HTTP响应的构造
- HTTP状态码

## 实现要求
1. 使用`http`模块创建服务器
2. 监听3000端口
3. 对所有请求返回200状态码
4. 返回HTML内容，包含基本的页面结构
5. 添加适当的响应头

## 代码模板
```javascript
// 引入http模块
const http = require('http');

// 创建服务器
const server = http.createServer((req, res) => {
  // 在这里编写你的代码
});

// 监听端口
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

## 挑战
1. 修改服务器，使其返回不同的HTML内容
2. 添加更多的HTTP响应头
3. 尝试修改监听端口

## 答案示例
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // 设置响应头
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Powered-By': 'Node.js'
  });
  
  // 响应内容
  res.write('<html>');
  res.write('<head><title>我的第一个HTTP服务器</title></head>');
  res.write('<body>');
  res.write('<h1>Hello, Node.js HTTP Server!</h1>');
  res.write('<p>这是一个简单的HTTP服务器示例</p>');
  res.write('</body>');
  res.write('</html>');
  
  // 结束响应
  res.end();
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```