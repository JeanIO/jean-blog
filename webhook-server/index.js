// deploy-server.js
const Koa = require('koa');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = new Koa();
const WEBHOOK_SECRETJSON = require('./config.json');

// ===== 执行日志写入 ./pack.log =====
// 拦截 console.log / console.error,把本进程所有输出(含 deploy.sh 的 stdout/stderr)追加写入
// pack.log(位于本文件同目录);控制台输出保留,方便前台调试
const LOG_FILE = path.join(__dirname, 'pack.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' }); // 'a' 追加,启动时想清空改成 'w'
const origLog = console.log.bind(console);
const origError = console.error.bind(console);

function writeLog(level, args) {
  const line =
    `[${new Date().toISOString()}] [${level}] ` +
    args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') +
    '\n';
  logStream.write(line);
}

console.log = (...args) => {
  writeLog('INFO', args);
  origLog(...args);
};
console.error = (...args) => {
  writeLog('ERROR', args);
  origError(...args);
};

const WEBHOOK_SECRET = WEBHOOK_SECRETJSON.webhookSecret;
const PORT = 9000;
let isDeploying = false; // 部署锁，防止并发冲突

// 捕获原始body（JSON原始buffer，签名校验必须用这个，不能解析后再序列化）
async function rawBodyMiddleware(ctx, next) {
  if (ctx.method === 'POST' && ctx.path === '/deploy') {
    const chunks = [];
    for await (const chunk of ctx.req) {
      chunks.push(chunk);
    }
    ctx.rawBody = Buffer.concat(chunks);
  }
  await next();
}

/**
 * GitHub 签名校验
 * @param {Buffer} rawBuffer 原始请求body
 * @param {string} signatureHeader X-Hub-Signature-256
 */
function verifySignature(rawBuffer, signatureHeader) {
  const [alg, hash] = signatureHeader.split('=');
  const hmac = crypto.createHmac(alg, WEBHOOK_SECRET);
  const digest = hmac.update(rawBuffer).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(digest));
}

app.use(rawBodyMiddleware);

app.use(async ctx => {
  // 只匹配 POST /deploy
  if (ctx.method !== 'POST' || ctx.path !== '/deploy') {
    ctx.status = 404;
    ctx.body = 'Not Found';
    return;
  }

  // 校验Content-Type，确认是json
  const contentType = ctx.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    ctx.status = 400;
    ctx.body = 'require application/json';
    return;
  }

  const sigHeader = ctx.headers['x-hub-signature-256'];
  if (!sigHeader) {
    ctx.status = 403;
    ctx.body = 'missing signature header';
    return;
  }

  // 校验签名
  if (!verifySignature(ctx.rawBody, sigHeader)) {
    ctx.status = 403;
    ctx.body = 'signature verify failed';
    return;
  }

  // 解析json payload
  const payload = JSON.parse(ctx.rawBody.toString());
  console.log('收到推送，分支：', payload.ref);

  // 只处理 main 分支
  if (payload.ref !== 'refs/heads/main') {
    ctx.body = 'skip: not main branch';
    return;
  }

  // 并发锁判断
  if (isDeploying) {
    ctx.status = 409;
    ctx.body = 'deploy task is running, skip this request';
    return;
  }

  console.log('✅ 开始执行部署脚本');
  isDeploying = true;

  // ========== 这里改成 spawn + /bin/sh 重点 ==========
  const sh = spawn('/bin/sh', [
    '/home/ubuntu/jean-blog/webhook-server/deploy.sh'
  ], {
    cwd: '/home/ubuntu/jean-blog/webhook-server',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // 实时stdout日志
  sh.stdout.on('data', (buf) => {
    console.log('deploy stdout:', buf.toString());
  });
  // 实时stderr日志
  sh.stderr.on('data', (buf) => {
    console.error('deploy stderr:', buf.toString());
  });

  sh.on('close', (code) => {
    isDeploying = false;
    if (code === 0) {
      console.log('✅ 部署脚本执行成功，退出码：', code);
    } else {
      console.error('❌ 部署脚本异常退出，退出码：', code);
    }
  });

  sh.on('error', (err) => {
    isDeploying = false;
    console.error('❌ 无法拉起部署进程：', err.message);
  });
  // =================================================

  // 立刻返回，不要阻塞，GitHub超时很短
  ctx.body = 'deploy task started';
});

app.listen(PORT, () => {
  console.log('webhook service running on 127.0.0.1:9000');
});
