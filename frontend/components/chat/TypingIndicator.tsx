'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.5 },
    animate: { 
      y: -8,
      opacity: 1,
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  };

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0.15 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0.3 }}
      />
    </div>
  );
};

// 流式文本显示组件 - 带打字机效果
interface StreamingTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  className,
  speed = 20,
}) => {
  // 使用 React.memo 避免不必要的重新渲染
  return (
    <div className={className}>
      <span>{text}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="inline-block w-0.5 h-5 ml-1 bg-blue-500 align-middle"
      />
    </div>
  );
};
