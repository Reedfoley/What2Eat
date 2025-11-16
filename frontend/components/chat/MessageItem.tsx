'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Message } from '@/lib/types';
import { StrategyBadge } from '@/components/ui/Badge';
import { StreamingText } from './TypingIndicator';
import DocumentList from '@/components/documents/DocumentList';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
}) => {
  const [showDocuments, setShowDocuments] = useState(false);
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        'flex w-full gap-3 px-4 py-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'flex flex-col max-w-[80%] gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Message bubble */}
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          {isStreaming ? (
            <StreamingText text={message.content} className="whitespace-pre-wrap" />
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>

          {/* Strategy badge for assistant messages */}
          {!isUser && message.strategy && (
            <StrategyBadge strategy={message.strategy} size="sm" animated />
          )}

          {/* Processing time */}
          {!isUser && message.metadata?.processing_time && (
            <span className="text-xs text-gray-400">
              {message.metadata.processing_time.toFixed(2)}s
            </span>
          )}
        </div>

        {/* Documents section */}
        {!isUser && message.documents && message.documents.length > 0 && (
          <div className="w-full mt-2">
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium',
                'text-blue-600 hover:text-blue-700',
                'bg-blue-50 hover:bg-blue-100',
                'rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={clsx(
                  'w-4 h-4 transition-transform',
                  showDocuments && 'rotate-90'
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {showDocuments ? '隐藏' : '查看'}相关文档 ({message.documents.length})
              </span>
            </button>

            {/* Documents list */}
            {showDocuments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2"
              >
                <DocumentList documents={message.documents} strategy={message.strategy} />
              </motion.div>
            )}
          </div>
        )}

        {/* Additional metadata */}
        {!isUser && message.metadata && (
          <div className="flex items-center gap-3 px-2 text-xs text-gray-400">
            {message.metadata.complexity !== undefined && (
              <span>复杂度: {message.metadata.complexity.toFixed(2)}</span>
            )}
            {message.metadata.relationship_intensity !== undefined && (
              <span>
                关系强度: {message.metadata.relationship_intensity.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const MessageItem = React.memo(MessageItemComponent, (prevProps, nextProps) => {
  // 如果是流式消息，总是重新渲染以显示最新内容
  if (prevProps.isStreaming || nextProps.isStreaming) {
    return prevProps.message.content === nextProps.message.content &&
           prevProps.isStreaming === nextProps.isStreaming;
  }
  // 对于非流式消息，比较消息内容
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content;
});
