// ============================================
// 消息列表组件
// ============================================
// 显示聊天消息列表，支持自动滚动和流式消息显示

'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/types';
import { useChatStore } from '@/store/chatStore';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

// ============================================
// 消息列表组件属性
// ============================================
interface MessageListProps {
  // 消息列表
  messages: Message[];
  // 是否正在加载
  isLoading?: boolean;
  // 当前流式消息内容
  currentStreamingMessage?: string | null;
  // 自定义 CSS 类名
  className?: string;
}

// ============================================
// 消息列表组件
// ============================================
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  currentStreamingMessage: _currentStreamingMessage = null,
  className,
}) => {
  // 消息列表底部的引用，用于自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  // 上一次的流式消息内容，用于检测变化
  const lastStreamingMessageRef = useRef<string | null>(null);
  
  // 从 Store 获取当前流式消息
  const currentStreamingMessage = useChatStore((state) => state.currentStreamingMessage);

  // ============================================
  // 自动滚动到底部函数
  // ============================================
  /**
   * 滚动到消息列表底部
   * 参数：behavior - 滚动行为（'smooth' 平滑滚动，'auto' 立即滚动）
   */
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    // 使用 requestAnimationFrame 确保 DOM 已更新后再滚动
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  };

  // ============================================
  // 副作用：监听流式消息变化
  // ============================================
  // 当流式消息内容更新时，实时滚动到底部
  useEffect(() => {
    if (currentStreamingMessage !== lastStreamingMessageRef.current) {
      lastStreamingMessageRef.current = currentStreamingMessage;
      scrollToBottom('auto');  // 立即滚动，不使用平滑动画
    }
  }, [currentStreamingMessage]);

  // ============================================
  // 副作用：监听消息列表变化
  // ============================================
  // 当新消息添加时，平滑滚动到底部
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // ============================================
  // 副作用：组件挂载时滚动到底部
  // ============================================
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  // ============================================
  // 动画配置
  // ============================================
  // 消息列表的进入动画
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // 子元素依次进入，间隔 0.1 秒
        staggerChildren: 0.1,
      },
    },
  };

  // ============================================
  // 组件渲染
  // ============================================
  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto ${className || ''}`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col min-h-full"
      >
        {/* 
          空状态：当没有消息、不在加载、没有流式消息时显示
          显示欢迎提示和使用说明
        */}
        {messages.length === 0 && !isLoading && !currentStreamingMessage && (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="text-center max-w-md px-4">
              {/* 欢迎图标 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-300 mb-3 sm:mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </motion.div>
              {/* 欢迎文本 */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                开始对话
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                向我提问关于菜谱的任何问题，我会帮您找到答案
              </p>
            </div>
          </div>
        )}

        {/* 消息列表容器 */}
        <div className="flex-1">
          {/* 
            使用 AnimatePresence 处理消息的进入和退出动画
            mode="popLayout" - 新消息进入时，旧消息会被推开
          */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* 
            流式消息显示
            当有流式消息时，实时显示正在生成的内容
          */}
          {currentStreamingMessage !== null && (
            <MessageItem
              message={{
                id: 'streaming',
                role: 'assistant',
                content: currentStreamingMessage,
                timestamp: new Date(),
              }}
              isStreaming={true}
            />
          )}

          {/* 
            加载指示器
            当正在加载但还没有流式消息时显示
            显示打字动画表示 AI 正在思考
          */}
          {isLoading && !currentStreamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start px-2 sm:px-4 py-3 sm:py-4"
            >
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </div>

        {/* 
          滚动锚点
          用于自动滚动到消息列表底部
        */}
        <div ref={messagesEndRef} />
      </motion.div>
    </div>
  );
};
