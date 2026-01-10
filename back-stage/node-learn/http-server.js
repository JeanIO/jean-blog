import http from 'node:http'
import * as fs from 'node:fs'
const server = http.createServer((req, res) => {
    // console.log(req.cork())
    // console.log(req.end([data[, encoding]][, callback]))
    // console.log(req.destroy([error]))
    console.log('req.url:', req.url)
    console.log('req.method:', req.method)
    console.log('req.destroyed:', req.destroyed)
    console.log('req.finished:', req.finished)
    console.log('req.headers:', req.headers)
    console.log('req.user-agent:', req.headers['user-agent'])
    // console.log('req.reusedSocket:', req.reusedSocket)
    // console.log('req.socket:', req.socket)
    console.log('req.maxHeadersCount:', req.maxHeadersCount)
    const data = fs.readFileSync('./assets/WechatIMG38.jpg')
    // res.setHeader('Content-Type', 'image/jpeg')
    // res.setHeader('Content-Disposition', 'attachment; filename=WechatIMG38.jpg')
    // res.write(data)
    res.end()
});
server.on("request", (req, res) => {
    // req.getHeader('user-agent')
    console.log('type', typeof req)
})
const client = http.ClientRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
})
client.se

server.listen(3000, () => {
    console.log('server is running on port 3000')
})
