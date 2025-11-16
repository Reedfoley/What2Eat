# 前端依赖参考

## 项目脚本命令

```json
"scripts": {
  "dev": "next dev",           // 启动开发服务器，支持热重载（自动刷新）
  "build": "next build",       // 构建生产版本，优化代码和性能
  "start": "next start"        // 启动生产服务器，运行已构建的应用
}
```

## 生产依赖

项目运行时必需的库：

```json
"dependencies": {
  "react": "^18",              // React 框架核心库 - 用于构建用户界面
  "react-dom": "^18",          // React DOM 渲染库 - 将 React 组件渲染到浏览器 DOM
  "next": "^14",               // Next.js 框架 - React 全栈框架，提供路由、SSR 等功能
  "axios": "^1",               // Axios HTTP 客户端 - 用于与后端 API 通信，支持拦截器和重试
  "zustand": "^4",             // Zustand 状态管理库 - 轻量级全局状态管理，用于管理聊天、UI 等状态
  "framer-motion": "^11",      // Framer Motion 动画库 - 用于创建流畅的 UI 动画和过渡效果
  "clsx": "^2"                 // clsx 条件类名工具 - 简化 CSS 类名的条件组合
}
```

## 开发依赖

仅在开发时需要的库：

```json
"devDependencies": {
  "typescript": "^5",          // TypeScript 编译器 - 为 JavaScript 添加类型检查
  "@types/node": "^20",        // Node.js 类型定义 - 提供 Node.js API 的类型提示
  "@types/react": "^18",       // React 类型定义 - 提供 React API 的类型提示
  "@types/react-dom": "^18",   // React DOM 类型定义 - 提供 React DOM API 的类型提示
  "tailwindcss": "^3",         // Tailwind CSS 样式框架 - 实用优先的 CSS 框架，用于快速构建 UI
  "postcss": "^8",             // PostCSS 处理器 - CSS 转换工具，用于处理 Tailwind CSS
  "autoprefixer": "^10",       // Autoprefixer - 自动添加浏览器前缀，提高浏览器兼容性
  "eslint-config-next": "^14"  // Next.js ESLint 配置 - 代码质量检查工具配置
}
```

## 依赖说明

### 核心框架
- **React 18** - 最新的 React 版本，提供更好的性能和新特性
- **Next.js 14** - 全栈 React 框架，提供服务端渲染、静态生成、API 路由等功能

### 状态管理
- **Zustand** - 轻量级状态管理库，比 Redux 更简洁，用于管理全局状态

### HTTP 通信
- **Axios** - Promise 基础的 HTTP 客户端，支持拦截器、超时、重试等功能

### 样式和动画
- **Tailwind CSS** - 实用优先的 CSS 框架，快速构建响应式 UI
- **Framer Motion** - React 动画库，创建流畅的交互动画
- **clsx** - 条件类名工具，简化动态 CSS 类名的组合

### 类型检查
- **TypeScript** - 为 JavaScript 添加静态类型检查，提高代码质量
- **@types/*** - 为第三方库提供类型定义

### 代码质量
- **ESLint** - 代码质量检查工具，发现潜在的代码问题

## 安装依赖

```bash
cd frontend
npm install
```

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 版本说明

- `^18` 表示 18.x.x 版本（允许小版本和补丁版本更新）
- `^14` 表示 14.x.x 版本
- 等等...

这种版本控制方式确保了依赖的稳定性，同时允许获取最新的补丁和小版本更新。
