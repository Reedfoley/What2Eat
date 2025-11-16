// ============================================
// 根布局组件 - 所有页面的基础布局
// ============================================
// 这是 Next.js App Router 的根布局文件
// 所有页面都会被包装在这个布局中

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ============================================
// 字体配置
// ============================================
// 从 Google Fonts 导入 Inter 字体
// subsets: 只加载拉丁字符子集，减少字体文件大小
// display: "swap" - 使用系统字体显示文本，直到 Inter 字体加载完成
// variable: 定义 CSS 变量名，可在样式中使用 var(--font-inter)
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// ============================================
// 页面元数据配置
// ============================================
// 这些信息会显示在浏览器标签页和搜索引擎结果中
export const metadata: Metadata = {
  // 页面标题 - 显示在浏览器标签页
  title: "菜谱 RAG 系统 - 智能菜谱检索与推荐",
  // 页面描述 - 显示在搜索引擎结果中
  description: "基于检索增强生成技术的智能菜谱搜索系统，支持传统检索和图RAG检索",
  // 搜索关键词
  keywords: ["菜谱", "RAG", "检索", "推荐", "AI"],
  // 作者信息
  authors: [{ name: "Recipe RAG Team" }],
  // 视口设置 - 用于响应式设计
  viewport: "width=device-width, initial-scale=1",
  // 主题颜色 - 浏览器地址栏颜色
  themeColor: "#3b82f6",
};

// ============================================
// 根布局组件
// ============================================
// children: 页面内容会通过这个 prop 传入
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTML 根元素
    // lang="zh-CN" - 设置页面语言为中文
    // className={inter.variable} - 应用字体 CSS 变量
    <html lang="zh-CN" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {/* 
          主容器
          min-h-screen: 最小高度为视口高度
          bg-gradient-to-br: 从左上到右下的渐变背景
          from-gray-50 to-gray-100: 从浅灰色到深灰色的渐变
        */}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* 页面内容会在这里渲染 */}
          {children}
        </div>
      </body>
    </html>
  );
}
