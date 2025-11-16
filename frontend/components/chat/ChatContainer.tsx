// ============================================
// 聊天容器组件
// ============================================
// 管理聊天的核心逻辑，包括消息发送、流式接收、错误处理等

'use client';

import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { api } from '@/lib/api';
import { handleAPIError, isRetryableError } from '@/lib/errorHandler';

// ============================================
// 聊天容器组件属性
// ============================================
interface ChatContainerProps {
  // 自定义 CSS 类名
  className?: string;
}

// ============================================
// 聊天容器组件
// ============================================
export const ChatContainer: React.FC<ChatContainerProps> = ({ className }) => {
  // ========== 状态管理 ==========
  // 从聊天 Store 获取状态和方法
  const {
    messages,
    isLoading,
    error,
    currentStreamingMessage,
    addMessage,
    startStreamingMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    setLoading,
    setError,
  } = useChatStore();

  // 从通知 Store 获取添加通知的方法
  const { addToast } = useToastStore();
  // 本地状态：用于重试的问题
  const [retryQuestion, setRetryQuestion] = useState<string | null>(null);

  // ============================================
  // 提交处理函数
  // ============================================
  /**
   * 处理用户提交的问题
   * 参数：
   *   - question: 用户的问题
   *   - isRetry: 是否为重试操作
   */
  const handleSubmit = async (question: string, isRetry: boolean = false) => {
    // 清除之前的错误和重试状态
    setError(null);
    setRetryQuestion(null);

    // 添加用户消息（仅在非重试时添加）
    if (!isRetry) {
      addMessage({
        role: 'user',
        content: question,
      });
    }

    // 设置加载状态
    setLoading(true);

    try {
      // 开始流式消息传输
      // flushSync 强制立即更新 React 状态，确保 UI 立即响应
      flushSync(() => {
        startStreamingMessage();
      });

      // 初始化流式数据收集变量
      let streamMetadata: any = {};
      let streamDocuments: any[] = [];
      let hasReceivedContent = false;

      // 调用 API 进行流式查询
      await api.queryStream(
        question,
        // 第一个回调：处理内容块
        (chunk) => {
          // 标记已接收内容
          hasReceivedContent = true;
          // 使用 flushSync 强制立即更新，确保每个块都立即显示
          flushSync(() => {
            updateStreamingMessage(chunk);
          });
        },
        // 第二个回调：处理元数据和完成事件
        (metadata) => {
          // 根据消息类型处理不同的数据
          if (metadata.type === 'metadata') {
            // 收集查询元数据
            streamMetadata = {
              complexity: metadata.complexity,
              relationship_intensity: metadata.relationship_intensity,
              strategy: metadata.strategy,
            };
          } else if (metadata.documents) {
            // 收集相关文档
            streamDocuments = metadata.documents;
          } else if (metadata.type === 'done') {
            // 流式传输完成 - 保存最终消息
            if (hasReceivedContent) {
              finalizeStreamingMessage(
                streamMetadata.strategy || 'unknown',
                streamDocuments,
                streamMetadata
              );
              
              // 显示成功通知
              addToast('查询成功完成', 'success', 3000);
            }
          }
        },
        // 第三个回调：处理错误
        (err) => {
          // 抛出错误以在 catch 块中处理
          throw err;
        }
      );
    } catch (err: any) {
      // 错误处理
      console.error('Query error:', err);
      const errorMessage = handleAPIError(err);
      setError(errorMessage);

      // 如果流式传输已开始，完成消息
      if (currentStreamingMessage !== null) {
        finalizeStreamingMessage();
      }

      // 检查错误是否可重试
      if (isRetryableError(err)) {
        // 保存问题以便重试
        setRetryQuestion(question);
        // 显示可重试的错误通知
        addToast(
          `${errorMessage}。您可以点击重试按钮重新发送请求。`,
          'error',
          0 // 不自动关闭
        );
      } else {
        // 显示不可重试的错误通知
        addToast(errorMessage, 'error', 7000);
      }

      // 添加错误消息到聊天
      addMessage({
        role: 'assistant',
        content: `抱歉，发生了错误：${errorMessage}`,
      });
    } finally {
      // 无论成功还是失败，都关闭加载状态
      setLoading(false);
    }
  };

  // ============================================
  // 重试处理函数
  // ============================================
  /**
   * 处理重试操作
   * 使用保存的问题重新提交
   */
  const handleRetry = () => {
    if (retryQuestion) {
      handleSubmit(retryQuestion, true);
    }
  };

  // ============================================
  // 动画配置
  // ============================================
  // 容器进入动画
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  // ============================================
  // 组件渲染
  // ============================================
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        'flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden',
        className
      )}
    >
      {/* 
        错误提示横幅
        显示错误信息和重试按钮
      */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-50 border-b border-red-200 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-red-600 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
            
            {/* 
              重试按钮
              仅在错误可重试时显示
            */}
            {retryQuestion && (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                    clipRule="evenodd"
                  />
                </svg>
                重试
              </button>
            )}
            
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* 
        消息列表区域
        显示所有聊天消息和流式内容
      */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentStreamingMessage={currentStreamingMessage}
        className="flex-1"
      />

      {/* 
        输入框区域
        用户输入问题的地方
      */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <InputBox onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </motion.div>
  );
};
