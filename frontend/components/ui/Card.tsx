import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
}) => {
  const baseStyles = 'rounded-lg transition-all';
  
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hoverable ? 'cursor-pointer hover:shadow-lg' : '';

  const Component = hoverable || onClick ? motion.div : 'div';
  const motionProps = hoverable || onClick ? {
    whileHover: { 
      scale: 1.01, 
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    whileTap: {
      scale: 0.99,
      transition: { duration: 0.1, ease: 'easeInOut' }
    }
  } : {};

  return (
    <Component
      className={clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={clsx('mb-3', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={clsx('text-gray-700', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};
