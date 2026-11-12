// deploy-server.js
const Koa = require('koa');
const crypto = require('crypto');
const { exec } = require('child_process');
const app = new Koa();
const WEBHOOK_SECRETJSON = require('./config.json');


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

  // 调用你写好的sh脚本
  exec('/home/ubuntu/jean-blog/webhook-server/deploy.sh', (err, stdout, stderr) => {
    isDeploying = false;
    if (err) {
      console.error('❌ 部署脚本异常：', err.message, stderr);
      return;
    }
    console.log('✅ 部署完成，输出：\n', stdout);
  });

  // 立刻返回，不要阻塞，GitHub超时很短
  ctx.body = 'deploy task started';
});

app.listen(PORT, () => {
  console.log('webhook service running on 127.0.0.1:9000');
});
