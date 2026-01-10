import req, { addResponseParser } from "./request"

type CosAuthResp = {
  credentials:{ sessionToken: string, tmpSecretId: string, tmpSecretKey: string },
  startTime: number,
  expiredTime: number
}

type CosFileKeyResp = {
  cosKey: string
}

export const getCOSAuth = addResponseParser<undefined, CosAuthResp>(() => {
  return req.get(`/services/getCOSAuthrization`)
}) 

export const getFileCosKey =  addResponseParser<string, CosFileKeyResp>((filename: string) => {
  return req.get(`/services/getCOSKey?filename=${filename}`)
})

