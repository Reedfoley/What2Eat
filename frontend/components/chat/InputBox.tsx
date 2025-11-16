// ============================================
// 输入框组件
// ============================================
// 用户输入问题的文本框，支持多行输入、自动调整高度、字符计数等

'use client';

import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';

// ============================================
// 输入框组件属性
// ============================================
interface InputBoxProps {
  // 提交时的回调函数
  onSubmit: (question: string) => void;
  // 是否禁用输入
  disabled?: boolean;
  // 输入框占位符文本
  placeholder?: string;
  // 最大字符数
  maxLength?: number;
}

// ============================================
// 输入框组件
// ============================================
export const InputBox: React.FC<InputBoxProps> = ({
  onSubmit,
  disabled = false,
  placeholder = '输入您的问题...',
  maxLength = 1000,
}) => {
  // ========== 状态管理 ==========
  // 输入框的值
  const [value, setValue] = useState('');
  // 文本框 DOM 引用
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ============================================
  // 提交处理函数
  // ============================================
  /**
   * 处理提交
   * 验证输入、调用回调、清空输入框
   */
  const handleSubmit = () => {
    // 去除首尾空格
    const trimmedValue = value.trim();
    // 检查输入是否有效且未禁用
    if (trimmedValue && !disabled) {
      // 调用提交回调
      onSubmit(trimmedValue);
      // 清空输入框
      setValue('');
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // ============================================
  // 键盘事件处理
  // ============================================
  /**
   * 处理键盘按下事件
   * Enter 键提交，Shift+Enter 换行
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 检查是否按下 Enter 键且没有按下 Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // 阻止默认的换行行为
      handleSubmit();
    }
  };

  // ============================================
  // 输入变化处理
  // ============================================
  /**
   * 处理输入框内容变化
   * 更新值、自动调整高度、检查字符限制
   */
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // 检查是否超过最大字符数
    if (newValue.length <= maxLength) {
      setValue(newValue);
      
      // 自动调整文本框高度以适应内容
      if (textareaRef.current) {
        // 先重置高度为 auto，以获取正确的 scrollHeight
        textareaRef.current.style.height = 'auto';
        // 设置高度为内容的实际高度
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  };

  // ============================================
  // 字符计数状态
  // ============================================
  // 当前字符数
  const characterCount = value.length;
  // 是否接近限制（超过 80%）
  const isNearLimit = characterCount > maxLength * 0.8;
  // 是否达到限制
  const isAtLimit = characterCount >= maxLength;

  // ============================================
  // 组件渲染
  // ============================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="relative flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* 输入框和提交按钮容器 */}
        <div className="flex gap-2">
          {/* 
            文本输入框
            - 支持多行输入
            - 自动调整高度
            - 最小高度 40px，最大高度 200px
          */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}  // 初始行数为 1
            className={clsx(
              'flex-1 resize-none outline-none bg-transparent',
              'text-gray-900 placeholder-gray-400',
              'min-h-[40px] max-h-[200px] overflow-y-auto',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none'
            )}
            style={{ lineHeight: '1.5' }}
          />
          
          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}  // 输入为空时禁用
            variant="primary"
            size="md"
            className="self-end"
          >
            {/* 发送图标 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </Button>
        </div>
        
        {/* 底部提示和字符计数 */}
        <div className="flex items-center justify-between text-xs">
          {/* 使用提示 */}
          <span className="text-gray-500">
            提示: Enter 发送, Shift+Enter 换行
          </span>
          
          {/* 
            字符计数
            - 灰色：正常
            - 橙色：接近限制（80%）
            - 红色：达到限制
          */}
          <span
            className={clsx(
              'font-medium transition-colors',
              isAtLimit && 'text-red-600',
              isNearLimit && !isAtLimit && 'text-orange-600',
              !isNearLimit && 'text-gray-400'
            )}
          >
            {characterCount} / {maxLength}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
