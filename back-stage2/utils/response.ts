import type { Context } from "koa"

const logResponse = (status: number, code: number, message: string, error: Error | null = null) => {
  const env = process.env.NODE_ENV || "development"
  if (env === "development") {
    if (status >= 400) {
      console.error(`[ERROR] ${code}: ${message}`, error ? error.stack : "")
    } else {
      console.log(`[SUCCESS] ${code}: ${message}`)
    }
  }
}

const generateResponseId = (): string => {
  return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface ResponseBody {
  id: string
  code: number
  message: string
  data: any
  error?: string
  stack?: string
  timestamp?: string
  warnings?: string[]
  errors?: string[]
  pagination?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

const response = {
  send(ctx: Context, status: number = 200, data: any = null, message: string = "Success", error: Error | null = null) {
    ctx.status = status
    const responseBody: ResponseBody = {
      id: generateResponseId(),
      code: status,
      message,
      data,
    }

    if (error) {
      responseBody.error = error instanceof Error ? error.message : String(error)
      if (process.env.NODE_ENV === "development" && error instanceof Error) {
        responseBody.stack = error.stack
      }
    }

    ctx.body = responseBody
    logResponse(status, status, message, error)
  },

  success(ctx: Context, data: any = null, message: string = "Success") {
    this.send(ctx, 200, data, message)
  },

  created(ctx: Context, data: any = null, message: string = "Created") {
    this.send(ctx, 201, data, message)
  },

  paginate(ctx: Context, items: any[] = [], total: number = 0, page: number = 1, pageSize: number = 10, message: string = "Data fetched successfully") {
    const totalPages = Math.ceil(total / pageSize)
    const data = {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    }
    this.send(ctx, 200, data, message)
  },

  warn(ctx: Context, data: any = null, message: string = "Operation completed with warnings", warnings: string[] = []) {
    ctx.status = 200
    ctx.body = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code: 200,
      message,
      data,
      warnings,
    }
    logResponse(200, 200, message)
  },

  badRequest(ctx: Context, message: string = "Bad Request", error: Error | null = null) {
    this.send(ctx, 400, null, message, error)
  },

  validationError(ctx: Context, message: string = "Validation Error", errors: string[] = []) {
    ctx.status = 400
    ctx.body = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code: 400,
      message,
      errors,
    }
    logResponse(400, 400, message)
  },

  notFound(ctx: Context, message: string = "Resource not found") {
    this.send(ctx, 404, null, message)
  },

  internalError(ctx: Context, message: string = "Internal Server Error", error: Error | null = null) {
    this.send(ctx, 500, null, message, error)
  },

  upStreamError(ctx: Context, message: string = "Upstream Error", error: Error | null = null) {
    this.send(ctx, 502, null, message, error)
  },

  unauthorized(ctx: Context, message: string = "Unauthorized access") {
    this.send(ctx, 401, null, message)
  },

  forbidden(ctx: Context, message: string = "Access forbidden") {
    this.send(ctx, 403, null, message)
  },

  conflict(ctx: Context, message: string = "Resource conflict", data: any = null) {
    this.send(ctx, 409, data, message)
  },

  serviceUnavailable(ctx: Context, message: string = "Service temporarily unavailable") {
    this.send(ctx, 503, null, message)
  },

  custom(ctx: Context, status: number, code: number, message: string = "", data: any = null, error: Error | null = null) {
    ctx.status = status
    const responseBody: ResponseBody = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code,
      message,
      data,
    }

    if (error) {
      responseBody.error = error instanceof Error ? error.message : String(error)
      if (process.env.NODE_ENV === "development" && error instanceof Error) {
        responseBody.stack = error.stack
      }
    }

    ctx.body = responseBody
    logResponse(status, code, message, error)
  },
}

export default response