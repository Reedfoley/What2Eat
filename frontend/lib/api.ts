// ============================================
// API 客户端模块
// ============================================
// 处理与后端 API 的所有通信
// 包括查询、统计、健康检查等

import axios, { AxiosInstance } from "axios";
import type { QueryRequest, QueryResponse, StatsResponse, HealthResponse } from "./types";
import { handleAPIError, APIError, isRetryableError } from "./errorHandler";

// ============================================
// API 配置常量
// ============================================
// 后端 API 基础 URL（从环境变量读取，默认为本地开发服务器）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// 最大重试次数
const MAX_RETRIES = 2;
// 重试延迟（毫秒）
const RETRY_DELAY = 1000;

// ============================================
// 工具函数
// ============================================
/**
 * 延迟函数
 * 用于在重试时等待指定的时间
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// API 客户端创建函数
// ============================================
/**
 * 创建 Axios 实例
 * 配置基础 URL、超时、请求头等
 * 添加响应拦截器处理错误
 */
const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    // 后端 API 基础 URL
    baseURL: API_BASE_URL,
    // 请求超时时间（2 分钟，用于流式响应）
    timeout: 120000,
    // 请求头
    headers: { "Content-Type": "application/json" },
  });

  // 添加响应拦截器处理错误
  client.interceptors.response.use(
    // 成功响应直接返回
    (response) => response,
    // 错误响应处理
    (error: any) => {
      // 使用错误处理函数获取用户友好的错误消息
      const errorMessage = handleAPIError(error);
      // 抛出自定义 API 错误
      throw new APIError(errorMessage, error.response?.status, error.response?.data);
    }
  );

  return client;
};

// 创建全局 API 客户端实例
const apiClient = createAPIClient();

// ============================================
// 重试机制函数
// ============================================
/**
 * 带指数退避的重试函数
 * 如果请求失败且错误可重试，则自动重试
 * 使用指数退避策略：每次重试延迟时间翻倍
 * 
 * 参数：
 *   - fn: 要执行的异步函数
 *   - retries: 最大重试次数（默认 2 次）
 * 
 * 返回：函数的执行结果
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: any;
  
  // 循环执行，最多尝试 retries + 1 次（初始尝试 + 重试次数）
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 执行函数
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 如果错误不可重试或已达到最大重试次数，则抛出错误
      if (!isRetryableError(error) || attempt === retries) throw error;
      
      // 计算延迟时间：指数退避（1000ms, 2000ms, 4000ms...）
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms...`);
      
      // 等待指定时间后重试
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// ============================================
// API 接口对象
// ============================================
// 导出所有 API 方法
export const api = {
  /**
   * 发送查询请求（非流式）
   * 等待完整响应后返回
   * 
   * 参数：question - 用户的问题
   * 返回：查询响应对象
   */
  query: async (question: string): Promise<QueryResponse> => {
    return retryWithBackoff(async () => {
      // 发送 POST 请求到 /api/query
      const response = await apiClient.post<QueryResponse>("/api/query", {
        question,
        stream: false,  // 不使用流式响应
      } as QueryRequest);
      return response.data;
    });
  },

  /**
   * 发送查询请求（流式）
   * 逐步接收响应，实时显示结果
   * 
   * 参数：
   *   - question: 用户的问题
   *   - onChunk: 接收到新内容块时的回调函数
   *   - onComplete: 流式传输完成时的回调函数
   *   - onError: 发生错误时的回调函数（可选）
   */
  queryStream: async (
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: (metadata: any) => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    try {
      // 使用 Fetch API 发送流式请求
      // 使用 Fetch 而不是 Axios 是因为 Fetch 原生支持流式响应
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",  // 包含认证信息
        body: JSON.stringify({ question, stream: true } as QueryRequest),
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(errorData.detail || "Query failed", response.status, errorData);
      }

      // 获取响应体的读取器
      const reader = response.body?.getReader();
      if (!reader) throw new APIError("No response body reader available");

      // 创建文本解码器
      const decoder = new TextDecoder();
      let buffer = "";

      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码字节为文本
        buffer += decoder.decode(value, { stream: true });
        // 按行分割
        const lines = buffer.split("\n");
        // 保留未完成的行到下一次迭代
        buffer = lines.pop() || "";

        // 处理每一行
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // 处理 Server-Sent Events (SSE) 格式
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            if (data === "[DONE]") continue;  // 流结束标记
            
            try {
              // 解析 JSON 数据
              const parsed = JSON.parse(data);
              
              // 根据消息类型处理
              if (parsed.type === "content" && parsed.content) {
                // 内容块
                onChunk(parsed.content);
              } else if (parsed.type === "metadata") {
                // 元数据
                onComplete(parsed);
              } else if (parsed.type === "documents") {
                // 文档列表
                onComplete({ documents: parsed.documents });
              } else if (parsed.type === "done") {
                // 流完成
              } else if (parsed.type === "error") {
                // 错误消息
                throw new Error(parsed.message);
              } else if (parsed.chunk) {
                // 兼容旧格式
                onChunk(parsed.chunk);
              } else if (parsed.metadata) {
                // 兼容旧格式
                onComplete(parsed.metadata);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e, "data:", data);
              // 如果解析失败，直接作为文本块处理
              onChunk(data);
            }
          } else {
            // 非 SSE 格式的行
            onChunk(trimmedLine);
          }
        }
      }

      // 处理剩余的缓冲数据
      if (buffer.trim()) onChunk(buffer.trim());
      // 通知流完成
      onComplete({});
    } catch (error) {
      console.error("Stream query error:", error);
      if (onError) onError(error as Error);
      else throw error;
    }
  },

  /**
   * 获取系统统计信息
   * 返回知识库、路由、数据库等统计数据
   */
  getStats: async (): Promise<StatsResponse> => {
    return retryWithBackoff(async () => {
      const response = await apiClient.get<StatsResponse>("/api/stats");
      return response.data;
    });
  },

  /**
   * 健康检查
   * 检查后端服务是否正常运行
   */
  healthCheck: async (): Promise<HealthResponse> => {
    return retryWithBackoff(async () => {
      const response = await apiClient.get<HealthResponse>("/api/health");
      return response.data;
    });
  },
};

export default api;
