import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'traditional' | 'graphRag' | 'combined' | 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  animated = false,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variantStyles = {
    traditional: 'bg-purple-100 text-purple-800 border border-purple-200',
    graphRag: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    combined: 'bg-orange-100 text-orange-800 border border-orange-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const badgeContent = (
    <span
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {badgeContent}
      </motion.span>
    );
  }

  return badgeContent;
};

// 策略徽章的便捷组件
interface StrategyBadgeProps {
  strategy: 'hybrid_traditional' | 'graph_rag' | 'combined';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StrategyBadge: React.FC<StrategyBadgeProps> = ({
  strategy,
  size = 'md',
  animated = false,
}) => {
  const strategyMap = {
    hybrid_traditional: { variant: 'traditional' as const, label: '传统检索' },
    graph_rag: { variant: 'graphRag' as const, label: '图RAG' },
    combined: { variant: 'combined' as const, label: '组合策略' },
  };

  const { variant, label } = strategyMap[strategy];

  return (
    <Badge variant={variant} size={size} animated={animated}>
      {label}
    </Badge>
  );
};
