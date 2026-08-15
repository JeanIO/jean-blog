import type { Context } from "koa"
import response from "../utils/response.js"
import STS from "qcloud-cos-sts"

interface CosConfig {
  secretId: string
  secretKey: string
  proxy: string
  durationSeconds: number
  bucket: string
  region: string
  endpoint?: string
}

function getPolicy(config: { region: string; bucket: string }) {
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
          "name/cos:CancelMultipartUpload",
        ],
        "effect": "allow",
        "principal": {
          "qcs": ["*"],
        },
        "resource": [`qcs::cos:${region}:uid/${bucket.split("-")[1]}:${bucket}/article/*`],
      },
    ],
  }
}

export async function getOSSAuthrization(ctx: Context): Promise<void> {
  const { COS_BUCKET, COS_REGION, COS_SECRET_ID, COS_SECRET_KEY } = process.env
  const config: CosConfig = {
    secretId: COS_SECRET_ID!,
    secretKey: COS_SECRET_KEY!,
    proxy: "",
    durationSeconds: 3600,
    bucket: COS_BUCKET!,
    region: COS_REGION!,
  }
  const policy = getPolicy(config)
  console.log(policy, policy.statement[0].resource, policy.statement[0].action)

  const prom = new Promise((res, rej) => {
    try {
      STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        endpoint: config.endpoint,
        policy: policy,
      }, function (err: any, tempKeys: any) {
        if (!err) {
          res(tempKeys)
        } else {
          rej(err)
        }
      })
    } catch (e) {
      rej(e)
    }
  })
  try {
    const v = await prom
    response.success(ctx, { ...(v as any), bucket: COS_BUCKET, region: COS_REGION })
  } catch (e: any) {
    response.upStreamError(ctx, "获取OSS授权失败", e)
  }
}

function generateCosKey(filename?: string): string {
  const date = new Date()
  const m = date.getMonth() + 1
  const ymd = `${date.getFullYear()}${m < 10 ? `0${m}` : m}${date.getDate()}`
  const r = ("000000" + Math.random() * 1000000).slice(-6)
  const cosKey = `article/${ymd}/${ymd}_${r}${filename ? `${filename}` : ""}`
  return cosKey
}

export async function getFileCosKey(ctx: Context): Promise<void> {
  const { filename } = ctx.query
  const cosKey = generateCosKey(filename as string | undefined)
  response.success(ctx, { cosKey })
}