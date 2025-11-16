// ============================================
// 通知提示 (Toast) 状态管理 Store
// ============================================
// 管理应用中的通知提示，如成功、错误、警告等消息

import { create } from "zustand";

// ============================================
// Toast 通知接口定义
// ============================================
export interface Toast {
  // 通知的唯一标识符
  id: string;
  // 通知消息内容
  message: string;
  // 通知类型：成功、错误、警告、信息
  type: "success" | "error" | "warning" | "info";
  // 通知显示时长（毫秒），0 表示不自动关闭
  duration?: number;
}

// ============================================
// Toast 状态接口定义
// ============================================
interface ToastState {
  // ========== 状态属性 ==========
  // 当前显示的所有通知列表
  toasts: Toast[];

  // ========== 状态操作方法 ==========
  // 添加新通知
  addToast: (
    message: string,
    type?: Toast["type"],
    duration?: number
  ) => void;
  // 移除指定通知
  removeToast: (id: string) => void;
  // 清除所有通知
  clearToasts: () => void;
}

// ============================================
// 创建 Toast Store
// ============================================
export const useToastStore = create<ToastState>((set) => ({
  // ========== 初始状态 ==========
  toasts: [],

  // ========== 状态操作方法 ==========

  /**
   * 添加新通知
   * 参数：
   *   - message: 通知消息内容
   *   - type: 通知类型（默认为 "info"）
   *   - duration: 显示时长（默认 5000ms，0 表示不自动关闭）
   */
  addToast: (message, type = "info", duration = 5000) => {
    // 生成唯一 ID
    const id = crypto.randomUUID();
    
    // 创建通知对象
    const toast: Toast = {
      id,
      message,
      type,
      duration,
    };

    // 添加通知到列表
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // 如果设置了时长，则在指定时间后自动移除
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          // 过滤掉已过期的通知
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  /**
   * 移除指定通知
   * 参数：id - 要移除的通知 ID
   */
  removeToast: (id) => {
    set((state) => ({
      // 过滤掉指定 ID 的通知
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * 清除所有通知
   */
  clearToasts: () => {
    set({ toasts: [] });
  },
}));
