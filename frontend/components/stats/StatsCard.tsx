"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatsCardProps } from "@/lib/types";

/**
 * StatsCard component displays a single statistic with an optional icon
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-default ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0 text-primary-500 dark:text-primary-400">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
