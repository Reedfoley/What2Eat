"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatsDashboardProps } from "@/lib/types";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import StatsCard from "./StatsCard";
import RouteChart from "./RouteChart";

/**
 * StatsDashboard component displays system statistics in a sidebar
 */
export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, isLoading, error, lastUpdated, fetchStats } = useStatsStore();
  const { addToast } = useToastStore();

  // Fetch stats when dashboard opens
  useEffect(() => {
    if (isOpen && !stats) {
      fetchStats().catch((err) => {
        addToast("无法加载统计数据，请稍后重试", "error", 5000);
      });
    }
  }, [isOpen, stats, fetchStats, addToast]);

  const handleRefresh = async () => {
    try {
      await fetchStats();
      addToast("统计数据已更新", "success", 3000);
    } catch (err) {
      addToast("刷新失败，请稍后重试", "error", 5000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  系统统计
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="关闭统计面板"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Last updated & Refresh button */}
              <div className="flex items-center justify-between mt-3">
                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    更新于: {lastUpdated.toLocaleTimeString("zh-CN")}
                  </p>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  刷新
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Loading state */}
              {isLoading && !stats && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                        加载失败
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats content */}
              {stats && (
                <>
                  {/* Knowledge Base Statistics */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      知识库统计
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <StatsCard
                        title="菜谱数量"
                        value={stats.knowledge_base.total_recipes}
                        icon={
                          <svg
                            className="w-8 h-8"
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
                        }
                      />
                      <StatsCard
                        title="食材数量"
                        value={stats.knowledge_base.total_ingredients}
                        icon={
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        }
                      />
                      <StatsCard
                        title="烹饪步骤"
                        value={stats.knowledge_base.total_cooking_steps}
                        icon={
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        }
                      />
                      <StatsCard
                        title="文档数量"
                        value={stats.knowledge_base.total_documents}
                        icon={
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        }
                      />
                    </div>

                    {/* Additional stats */}
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            文档块数量
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stats.knowledge_base.total_chunks.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Milvus 向量数
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stats.milvus.row_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    {stats.knowledge_base.categories.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          菜谱分类
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {stats.knowledge_base.categories.map((category) => (
                            <span
                              key={category}
                              className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Routing Statistics */}
                  <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <RouteChart routingStats={stats.routing} />
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StatsDashboard;
