import response from '../utils/response.js';
import STS from "qcloud-cos-sts"



function getPolicy(config) {
  const { region, bucket } = config
  return {
    "version": "2.0",
    "statement": [
      {
        "action": [
          "name/cos:PutObject",
          "name/cos:GetObject",
          "name/cos:ListMultipartUploads",
          "name/cos:InitiateMultipartUpload",
          "name/cos:UploadPart",
          "name/cos:CompleteMultipartUpload",
          "name/cos:CancelMultipartUpload"
        ],
        "effect": "allow",
        "principal": {
         "qcs": ["*"]                    // 允许任意用户使用（如果是前端直传）
        },
        // qcs::cos:ap-beijing:uid/1250000000:examplebucket-1250000000/*
        //// "resource": ["qcs::cos:ap-guangzhou:uid/1250000000:examplebucket-1250000000/folder/*"]
        "resource": [`qcs::cos:${region}:uid/${bucket.split('-')[1]}:${bucket}/article/*`]
      }
    ]
  }
}

const getOSSAuthrization = async (ctx) => {

  const { COS_BUCKET, COS_REGION, COS_SECRET_ID, COS_SECRET_KEY } = process.env;
  const config = {
    secretId: COS_SECRET_ID, // 固定密钥
    secretKey: COS_SECRET_KEY, // 固定密钥
    proxy: '',
    durationSeconds: 3600,
    // host: 'sts.tencentcloudapi.com', // 域名，非必须，默认为 sts.tencentcloudapi.com
    // endpoint: 'sts.tencentcloudapi.com', // 域名，非必须，与host二选一，默认为 sts.tencentcloudapi.com
// https://wangjiarui1995-1257100122.cos.ap-beijing.myqcloud.com
    // 放行判断相关参数
    bucket: COS_BUCKET,
    region: COS_REGION,
  }
  let policy = getPolicy(config)
  console.log(policy, policy.statement[0].resource, policy.statement[0].action)
  const prom = new Promise((res, rej) => {
    // TODO: 实现OSS授权逻辑
    try {
      STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        endpoint: config.endpoint,
        policy: policy,
      }, function (err, tempKeys) {
        if (!err) {
          res(tempKeys)
        } else {
          rej(err)
        }
      });
    } catch (e) {
      rej(e)
    }
  })
  try {
    const v = await prom;
    response.success(ctx, { ...v, bucket: COS_BUCKET, region: COS_REGION });
  }catch(e) {
    response.upStreamError(ctx, '获取OSS授权失败', e);
  }
};

const generateCosKey = function (filename) {
  const date = new Date();
  const m = date.getMonth() + 1;
  const ymd = `${date.getFullYear()}${m < 10 ? `0${m}` : m}${date.getDate()}`;
  const r = ('000000' + Math.random() * 1000000).slice(-6);
  const cosKey = `article/${ymd}/${ymd}_${r}${filename ? `${filename}` : ''}`;
  return cosKey;
};

const getFileCosKey = async (ctx) => {
  console.log("hereasdasdasd")
  const { filename } = ctx.query;
  const cosKey = generateCosKey(filename);
  response.success(ctx, { cosKey });
}


export { getOSSAuthrization, getFileCosKey };