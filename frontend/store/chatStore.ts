// ============================================
// 聊天状态管理 Store
// ============================================
// 使用 Zustand 管理全局聊天状态
// 包括消息列表、加载状态、错误信息等

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Message } from "@/lib/types";

// ============================================
// 聊天状态接口定义
// ============================================
interface ChatState {
  // ========== 状态属性 ==========
  // 聊天消息列表
  messages: Message[];
  // 是否正在加载（等待 API 响应）
  isLoading: boolean;
  // 错误消息（如果有错误）
  error: string | null;
  // 当前正在流式传输的消息内容
  currentStreamingMessage: string | null;
  // 当前正在流式传输的消息 ID
  currentStreamingMessageId: string | null;

  // ========== 状态操作方法 ==========
  // 添加新消息到聊天列表
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  // 更新流式消息内容（追加新内容）
  updateStreamingMessage: (content: string) => void;
  // 开始流式消息传输，返回消息 ID
  startStreamingMessage: () => string;
  // 完成流式消息传输，保存最终消息
  finalizeStreamingMessage: (
    strategy?: Message["strategy"],
    documents?: Message["documents"],
    metadata?: Message["metadata"]
  ) => void;
  // 清除所有消息
  clearMessages: () => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置错误消息
  setError: (error: string | null) => void;
}

// ============================================
// localStorage 存储配置
// ============================================
// 最大存储大小：4.5MB（留出缓冲空间）
// 防止 localStorage 超出浏览器限制（通常为 5-10MB）
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024;

// ============================================
// 自定义 localStorage 存储实现
// ============================================
// 包含错误处理和容量管理
// 当存储超过限制时，自动删除旧消息
const customStorage: StateStorage = {
  // 从 localStorage 读取数据
  getItem: (name: string): string | null => {
    try {
      const value = localStorage.getItem(name);
      return value;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  // 写入数据到 localStorage
  setItem: (name: string, value: string): void => {
    try {
      // 检查数据是否超过存储限制
      if (value.length > MAX_STORAGE_SIZE) {
        console.warn("Storage limit exceeded, trimming old messages");
        
        // 解析状态对象
        const state = JSON.parse(value);
        if (state.state?.messages && Array.isArray(state.state.messages)) {
          // 保留最新的消息，删除旧消息直到符合大小限制
          const messages = state.state.messages;
          let trimmedMessages = messages;
          let trimmedValue = value;
          
          // 循环删除最旧的消息，直到数据大小符合限制
          while (trimmedValue.length > MAX_STORAGE_SIZE && trimmedMessages.length > 1) {
            // 删除第一条（最旧的）消息
            trimmedMessages = trimmedMessages.slice(1);
            state.state.messages = trimmedMessages;
            trimmedValue = JSON.stringify(state);
          }
          
          localStorage.setItem(name, trimmedValue);
          return;
        }
      }
      
      // 正常保存数据
      localStorage.setItem(name, value);
    } catch (error) {
      // 处理 QuotaExceededError（存储空间已满）
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.error("localStorage quota exceeded, clearing old data");
        try {
          // 尝试清除旧数据后重新保存
          localStorage.removeItem(name);
          localStorage.setItem(name, value);
        } catch (retryError) {
          console.error("Failed to save to localStorage even after clearing:", retryError);
        }
      } else {
        console.error("Error writing to localStorage:", error);
      }
    }
  },

  // 从 localStorage 删除数据
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// ============================================
// 创建聊天 Store
// ============================================
// 使用 Zustand 的 persist 中间件实现状态持久化
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      messages: [],
      isLoading: false,
      error: null,
      currentStreamingMessage: null,
      currentStreamingMessageId: null,

      // ========== 状态操作方法 ==========

      /**
       * 添加新消息到聊天列表
       * 自动生成消息 ID 和时间戳
       */
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),  // 生成唯一 ID
          timestamp: new Date(),     // 记录当前时间
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      /**
       * 开始流式消息传输
       * 创建一个新的流式消息，返回其 ID
       * 第二个参数 false 禁用批处理，确保立即更新
       */
      startStreamingMessage: () => {
        const messageId = crypto.randomUUID();
        set({
          currentStreamingMessage: "",
          currentStreamingMessageId: messageId,
        }, false); // 禁用批处理，立即更新
        return messageId;
      },

      /**
       * 更新流式消息内容
       * 将新内容追加到现有的流式消息中
       * 禁用批处理确保每个块都立即显示
       */
      updateStreamingMessage: (content) => {
        set((state) => ({
          currentStreamingMessage: (state.currentStreamingMessage || '') + content,
        }), false); // 禁用批处理，立即更新
      },

      /**
       * 完成流式消息传输
       * 将流式消息转换为最终消息并保存到消息列表
       */
      finalizeStreamingMessage: (strategy, documents, metadata) => {
        // 获取当前的流式消息信息
        const { currentStreamingMessage, currentStreamingMessageId } = useChatStore.getState();

        if (currentStreamingMessage !== null && currentStreamingMessageId) {
          // 创建最终消息对象
          const newMessage: Message = {
            id: currentStreamingMessageId,
            role: "assistant",
            content: currentStreamingMessage,
            timestamp: new Date(),
            strategy,
            documents,
            metadata,
          };

          // 保存消息并清除流式状态
          set((state) => ({
            messages: [...state.messages, newMessage],
            currentStreamingMessage: null,
            currentStreamingMessageId: null,
            isLoading: false,
          }));
        }
      },

      /**
       * 清除所有消息
       * 重置聊天状态到初始状态
       */
      clearMessages: () => {
        set({
          messages: [],
          currentStreamingMessage: null,
          currentStreamingMessageId: null,
          error: null,
        });
      },

      /**
       * 设置加载状态
       * 用于显示/隐藏加载指示器
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * 设置错误消息
       * 同时将加载状态设为 false
       */
      setError: (error) => {
        set({ error, isLoading: false });
      },
    }),
    {
      // ========== 持久化配置 ==========
      // localStorage 中的存储键名
      name: "chat-storage",
      // 使用自定义存储实现
      storage: createJSONStorage(() => customStorage),
      // 只持久化消息列表，其他状态不保存
      partialize: (state) => ({
        messages: state.messages,
      }),
      
      // ========== 自定义序列化 ==========
      // 处理 Date 对象的序列化
      // JSON 不能直接序列化 Date，需要转换为 ISO 字符串
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            messages: state.state.messages.map((msg: Message) => ({
              ...msg,
              // 将 Date 对象转换为 ISO 字符串
              timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
            })),
          },
        });
      },
      
      // ========== 自定义反序列化 ==========
      // 恢复 Date 对象
      // 从 localStorage 读取时，将 ISO 字符串转换回 Date 对象
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state?.messages) {
          parsed.state.messages = parsed.state.messages.map((msg: any) => ({
            ...msg,
            // 将 ISO 字符串转换回 Date 对象
            timestamp: new Date(msg.timestamp),
          }));
        }
        return parsed;
      },
    }
  )
);
