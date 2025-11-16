// ============================================
// API 错误处理模块
// ============================================
// 处理 API 请求中的各种错误情况

/**
 * 自定义 API 错误类
 * 用于统一处理和识别 API 相关的错误
 */
export class APIError extends Error {
  constructor(
    // 错误消息
    message: string,
    // HTTP 状态码（可选）
    public statusCode?: number,
    // 错误详情（可选）
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

// ============================================
// API 错误处理函数
// ============================================
/**
 * 处理 API 错误并返回用户友好的错误消息
 * 参数：error - 捕获的错误对象
 * 返回：用户友好的错误消息字符串
 */
export const handleAPIError = (error: any): string => {
  // 记录详细错误信息用于调试
  console.error("API Error:", error);

  // 检查是否有服务器响应
  if (error.response) {
    // 服务器返回了错误响应
    const status = error.response.status;
    const data = error.response.data;

    // 根据 HTTP 状态码返回相应的错误消息
    if (status === 503) {
      // 503 Service Unavailable - 服务不可用
      return "系统正在初始化，请稍后再试";
    } else if (status >= 500) {
      // 5xx 服务器错误
      return "服务器错误，请稍后重试";
    } else if (status === 400) {
      // 400 Bad Request - 请求参数错误
      return data?.detail || "请求参数无效";
    } else if (status === 404) {
      // 404 Not Found - 资源不存在
      return "请求的资源不存在";
    } else if (status === 429) {
      // 429 Too Many Requests - 请求过于频繁
      return "请求过于频繁，请稍后再试";
    }

    // 返回服务器返回的错误详情
    return data?.detail || data?.message || "请求失败，请重试";
  } else if (error.request) {
    // 请求已发送但没有收到响应（网络错误）
    return "无法连接到服务器，请检查网络连接";
  } else if (error instanceof APIError) {
    // 自定义 API 错误
    return error.message;
  }

  // 未知错误
  return "发生未知错误，请重试";
};

// ============================================
// 网络错误检查函数
// ============================================
/**
 * 检查错误是否为网络错误
 * 网络错误：请求已发送但没有收到响应
 */
export const isNetworkError = (error: any): boolean => {
  return error.request && !error.response;
};

// ============================================
// 超时错误检查函数
// ============================================
/**
 * 检查错误是否为超时错误
 * 超时错误：请求超过了指定的时间限制
 */
export const isTimeoutError = (error: any): boolean => {
  return error.code === "ECONNABORTED" || error.message?.includes("timeout");
};

// ============================================
// 可重试错误检查函数
// ============================================
/**
 * 检查错误是否可以重试
 * 可重试的错误包括：网络错误、超时错误、5xx 服务器错误、速率限制
 */
export const isRetryableError = (error: any): boolean => {
  // 网络错误和超时错误可以重试
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  // 检查 HTTP 状态码
  if (error.response) {
    const status = error.response.status;
    // 5xx 服务器错误和 429 速率限制可以重试
    return status >= 500 || status === 429;
  }

  return false;
};
