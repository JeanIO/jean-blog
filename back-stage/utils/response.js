// 统一API响应格式工具

// 日志记录函数
const logResponse = (status, code, message, error = null) => {
  // 在生产环境中可以配置更复杂的日志记录逻辑
  const env = process.env.NODE_ENV || 'development';
  if (env === 'development') {
    if (status >= 400) {
      console.error(`[ERROR] ${code}: ${message}`, error ? error.stack : '');
    } else {
      console.log(`[SUCCESS] ${code}: ${message}`);
    }
  }
};

// 生成带时间戳的响应ID
const generateResponseId = () => {
  return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const response = {
  // 基础响应方法
  send(ctx, status = 200, data = null, message = 'Success', error = null) {
    ctx.status = status;
    const responseBody = {
      id: generateResponseId(),
      code: status,
      message,
      data
    };
    
    // 仅在有错误时添加error字段
    if (error) {
      responseBody.error = error instanceof Error ? error.message : String(error);
      // 在开发环境中可以添加更详细的错误信息
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        responseBody.stack = error.stack;
      }
    }
    
    ctx.body = responseBody;
    console.log(responseBody);
    logResponse(status, status, message, error);
  },

  // 成功响应
  success(ctx, data = null, message = 'Success') {
    this.send(ctx, 200, data, message);
  },
  
  // 创建成功响应
  created(ctx, data = null, message = 'Created') {
    this.send(ctx, 201, data, message);
  },
  
  // 分页数据响应
  paginate(ctx, items = [], total = 0, page = 1, pageSize = 10, message = 'Data fetched successfully') {
    const totalPages = Math.ceil(total / pageSize);
    const data = {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      }
    };
    this.send(ctx, 200, data, message);
  },

  // 警告响应（业务警告，但操作成功）
  warn(ctx, data = null, message = 'Operation completed with warnings', warnings = []) {
    ctx.status = 200;
    ctx.body = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code: 200,
      message,
      data,
      warnings
    };
    logResponse(200, 200, message);
  },
  
  // 客户端错误响应
  badRequest(ctx, message = 'Bad Request', error = null) {
    this.send(ctx, 400, null, message, error);
  },
  
  // 验证错误响应
  validationError(ctx, message = 'Validation Error', errors = []) {
    ctx.status = 400;
    ctx.body = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code: 400,
      message,
      errors
    };
    logResponse(400, 400, message);
  },
  
  // 未找到响应
  notFound(ctx, message = 'Resource not found') {
    this.send(ctx, 404, null, message);
  },
  
  // 服务器错误响应
  internalError(ctx, message = 'Internal Server Error', error = null) {
    this.send(ctx, 500, null, message, error);
  },

  // 上游错误响应
  upStreamError(ctx, message = 'Upstream Error', error = null) {
    this.send(ctx, 502, null, message, error);
  },
  
  // 未授权响应
  unauthorized(ctx, message = 'Unauthorized access') {
    this.send(ctx, 401, null, message);
  },
  
  // 禁止响应
  forbidden(ctx, message = 'Access forbidden') {
    this.send(ctx, 403, null, message);
  },

  // 冲突响应
  conflict(ctx, message = 'Resource conflict', data = null) {
    this.send(ctx, 409, data, message);
  },

  // 服务不可用响应
  serviceUnavailable(ctx, message = 'Service temporarily unavailable') {
    this.send(ctx, 503, null, message);
  },

  // 自定义代码响应
  custom(ctx, status, code, message = '', data = null, error = null) {
    ctx.status = status;
    const responseBody = {
      id: generateResponseId(),
      timestamp: new Date().toISOString(),
      code,
      message,
      data
    };
    
    if (error) {
      responseBody.error = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        responseBody.stack = error.stack;
      }
    }
    
    ctx.body = responseBody;
    logResponse(status, code, message, error);
  }
};

export default response;