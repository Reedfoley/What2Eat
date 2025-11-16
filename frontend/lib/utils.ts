// ============================================
// 工具函数库
// ============================================
// 包含常用的辅助函数

import { type ClassValue, clsx } from "clsx";

// ============================================
// CSS 类名合并函数
// ============================================
// 用于条件性地组合 CSS 类名
// 例如：cn("px-2", condition && "bg-red-500")
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ============================================
// 时间戳格式化函数
// ============================================
// 将日期转换为相对时间字符串（如"5分钟前"）
// 参数：date - 要格式化的日期对象
// 返回：格式化后的时间字符串
export function formatTimestamp(date: Date): string {
  // 计算当前时间与给定时间的差值
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 转换为不同的时间单位
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 根据时间差返回相应的字符串
  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  // 超过 7 天则显示完整日期
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// 检索策略显示名称函数
// ============================================
// 将策略代码转换为用户友好的显示名称
// 参数：strategy - 策略代码（如 "hybrid_traditional"）
// 返回：显示名称（如 "传统检索"）
export function getStrategyDisplayName(strategy: string | undefined): string {
  // 策略代码到显示名称的映射
  const strategies: Record<string, string> = {
    hybrid_traditional: "传统检索",      // 基于向量相似度的检索
    graph_rag: "图RAG检索",              // 基于知识图谱的检索
    combined: "组合策略",                // 结合两种方法的检索
  };
  
  // 返回对应的显示名称，如果不存在则返回"未知策略"
  return strategies[strategy || ""] || "未知策略";
}

// ============================================
// 百分比格式化函数
// ============================================
// 将小数转换为百分比字符串
// 参数：value - 0-1 之间的小数（如 0.75）
// 返回：百分比字符串（如 "75.0%"）
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
