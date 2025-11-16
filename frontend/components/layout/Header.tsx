// ============================================
// 页面头部组件
// ============================================
// 显示应用标题、清除历史和统计信息按钮

"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useChatStore } from "@/store/chatStore";

// ============================================
// 头部组件属性
// ============================================
interface HeaderProps {
  // 统计信息按钮点击回调
  onStatsClick?: () => void;
}

// ============================================
// 头部组件
// ============================================
export default function Header({ onStatsClick }: HeaderProps) {
  // ========== 状态管理 ==========
  // 从聊天 Store 获取清除消息的方法
  const clearMessages = useChatStore((state) => state.clearMessages);
  // 获取当前消息列表
  const messages = useChatStore((state) => state.messages);

  // ============================================
  // 清除历史处理函数
  // ============================================
  /**
   * 处理清除聊天历史
   * 显示确认对话框，用户确认后清除所有消息
   */
  const handleClearHistory = () => {
    // 如果没有消息，直接返回
    if (messages.length === 0) return;
    
    // 显示确认对话框
    if (window.confirm("确定要清除所有聊天历史吗？此操作无法撤销。")) {
      // 用户确认后清除消息
      clearMessages();
    }
  };

  // ============================================
  // 组件渲染
  // ============================================
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 
          标志和标题
          显示应用图标和名称
        */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">菜谱 RAG 系统</h1>
            <p className="text-xs text-gray-500">智能菜谱检索与推荐</p>
          </div>
        </div>

        {/* 
          操作按钮区域
          包含清除历史和统计信息按钮
        */}
        <div className="flex items-center space-x-3">
          {/* 
            清除历史按钮（桌面版）
            仅在有消息时启用
          */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="hidden sm:flex"
            title="清除聊天历史"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            清除历史
          </Button>

          {/* 
            清除历史按钮（移动版）
            仅在移动设备上显示，仅显示图标
          */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="flex sm:hidden"
            title="清除聊天历史"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>

          {/* 
            统计信息按钮（桌面版）
            显示文字和图标
          */}
          <Button
            variant="outline"
            size="sm"
            onClick={onStatsClick}
            className="hidden sm:flex"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            统计信息
          </Button>
          
          {/* 
            统计信息按钮（移动版）
            仅显示图标
          */}
          <Button
            variant="outline"
            size="sm"
            onClick={onStatsClick}
            className="flex sm:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
