import type { Config } from "tailwindcss";

// Tailwind CSS 配置
const config: Config = {
  // 指定 Tailwind 扫描的文件路径，生成相应的 CSS 类
  content: [
    // 扫描 app 目录下的所有 JavaScript 和 TypeScript 文件
    "./app/**/*.{js,ts,jsx,tsx}",
    // 扫描 components 目录下的所有 JavaScript 和 TypeScript 文件
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  
  // 主题配置
  theme: {
    // extend 用于扩展默认主题，这里为空表示使用默认主题
    extend: {},
  },
  
  // 插件列表，用于扩展 Tailwind 功能
  plugins: [],
};

export default config;
