// ============================================
// 主页面组件
// ============================================
// 应用的主要页面，包含聊天界面、统计信息、通知等

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { ToastContainer } from '@/components/ui/Toast';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';

// ============================================
// 主页面组件
// ============================================
export default function Home() {
  // ========== 状态管理 ==========
  // 从 UI Store 获取状态和方法
  const { statsDashboardOpen, toggleStatsDashboard, setIsMobile } = useUIStore();
  // 从聊天 Store 获取消息列表
  const { messages } = useChatStore();
  // 从通知 Store 获取通知列表
  const { toasts, removeToast } = useToastStore();

  // ============================================
  // 副作用：检测移动设备
  // ============================================
  /**
   * 监听窗口大小变化，检测是否为移动设备
   * 移动设备判断标准：宽度 < 768px
   */
  useEffect(() => {
    // 检查是否为移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检查
    checkMobile();
    // 监听窗口大小变化事件
    window.addEventListener('resize', checkMobile);

    // 清理：移除事件监听器
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // ============================================
  // 页面动画配置
  // ============================================
  // 页面进入时的淡入动画
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // ============================================
  // 组件渲染
  // ============================================
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-screen"
    >
      {/* 
        页面头部
        包含标题、清除历史、统计信息按钮等
      */}
      <Header onStatsClick={toggleStatsDashboard} />

      {/* 
        主要内容区域
        包含欢迎屏幕和聊天界面
      */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-full flex flex-col">
            {/* 
              欢迎屏幕
              当没有消息时显示，包含功能介绍和示例问题
            */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex-1 flex flex-col items-center justify-center pb-8"
              >
                <div className="text-center max-w-2xl mx-auto space-y-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                  >
                    <svg
                      className="w-10 h-10"
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
                  </motion.div>

                  {/* Title */}
                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                      欢迎使用菜谱 RAG 系统
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                      智能菜谱检索与推荐助手
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-white rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 text-purple-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">传统检索</h3>
                      <p className="text-sm text-gray-600">
                        基于向量相似度的快速检索
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 bg-white rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 text-cyan-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">图 RAG</h3>
                      <p className="text-sm text-gray-600">
                        利用知识图谱的深度检索
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 bg-white rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 text-orange-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">智能路由</h3>
                      <p className="text-sm text-gray-600">
                        自动选择最佳检索策略
                      </p>
                    </motion.div>
                  </div>

                  {/* Prompt suggestions */}
                  <div className="mt-8 text-left">
                    <p className="text-sm text-gray-500 mb-3">试试这些问题：</p>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                        💡 "如何做红烧肉？"
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                        💡 "有什么适合夏天的凉菜？"
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                        💡 "番茄和鸡蛋可以做什么菜？"
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 
              聊天界面
              始终渲染以保持输入框状态
              当没有消息时高度为 auto，有消息时填满剩余空间
            */}
            <ChatContainer className={messages.length === 0 ? 'h-auto' : 'h-full'} />
          </div>
        </div>
      </main>

      {/* 
        统计信息仪表板侧边栏
        显示知识库、路由、数据库等统计信息
      */}
      <StatsDashboard
        isOpen={statsDashboardOpen}
        onClose={toggleStatsDashboard}
      />

      {/* 
        通知提示容器
        显示成功、错误、警告等消息
      */}
      <ToastContainer
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: removeToast,
        }))}
        position="top-right"
      />
    </motion.div>
  );
}
