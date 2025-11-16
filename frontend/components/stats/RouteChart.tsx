"use client";

import React from "react";
import { motion } from "framer-motion";
import { RoutingStats } from "@/lib/types";

interface RouteChartProps {
  routingStats: RoutingStats;
}

/**
 * RouteChart component displays routing statistics as a bar chart
 */
export const RouteChart: React.FC<RouteChartProps> = ({ routingStats }) => {
  const strategies = [
    {
      name: "传统检索",
      count: routingStats.traditional_count,
      ratio: routingStats.traditional_ratio,
      color: "bg-purple-500",
      lightColor: "bg-purple-100",
    },
    {
      name: "图RAG",
      count: routingStats.graph_rag_count,
      ratio: routingStats.graph_rag_ratio,
      color: "bg-cyan-500",
      lightColor: "bg-cyan-100",
    },
    {
      name: "组合策略",
      count: routingStats.combined_count,
      ratio: routingStats.combined_ratio,
      color: "bg-orange-500",
      lightColor: "bg-orange-100",
    },
  ];

  const maxCount = Math.max(
    routingStats.traditional_count,
    routingStats.graph_rag_count,
    routingStats.combined_count
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
        查询路由分布
      </h3>

      {routingStats.total_queries === 0 ? (
        <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          暂无查询数据
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-1.5 sm:space-y-2"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${strategy.color}`} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {strategy.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {strategy.count} 次
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white min-w-[2.5rem] sm:min-w-[3rem] text-right">
                    {(strategy.ratio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar chart */}
              <div className={`h-6 sm:h-8 rounded-lg overflow-hidden ${strategy.lightColor}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: maxCount > 0 ? `${(strategy.count / maxCount) * 100}%` : "0%",
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className={`h-full ${strategy.color} flex items-center justify-end px-2 sm:px-3`}
                >
                  {strategy.count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white">
                      {strategy.count}
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Total queries */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            总查询次数
          </span>
          <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {routingStats.total_queries}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RouteChart;
