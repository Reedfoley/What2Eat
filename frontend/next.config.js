/** @type {import('next').NextConfig} */
// Next.js 配置对象
const nextConfig = {
  // React 严格模式：在开发环境中检测潜在问题
  // 会在组件挂载时故意调用两次，帮助发现副作用问题
  reactStrictMode: true,
}

// 导出配置
module.exports = nextConfig
