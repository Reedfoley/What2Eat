// ============================================
// UI 状态管理 Store
// ============================================
// 管理应用的 UI 相关状态，如侧边栏、主题等

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// UI 状态接口定义
// ============================================
interface UIState {
  // ========== 状态属性 ==========
  // 侧边栏是否打开
  sidebarOpen: boolean;
  // 统计信息仪表板是否打开
  statsDashboardOpen: boolean;
  // 当前主题（浅色或深色）
  theme: "light" | "dark";
  // 是否为移动设备
  isMobile: boolean;

  // ========== 状态操作方法 ==========
  // 切换侧边栏状态
  toggleSidebar: () => void;
  // 设置侧边栏状态
  setSidebarOpen: (open: boolean) => void;
  // 切换统计仪表板状态
  toggleStatsDashboard: () => void;
  // 设置统计仪表板状态
  setStatsDashboardOpen: (open: boolean) => void;
  // 设置主题
  setTheme: (theme: "light" | "dark") => void;
  // 切换主题
  toggleTheme: () => void;
  // 设置是否为移动设备
  setIsMobile: (isMobile: boolean) => void;
}

// ============================================
// 创建 UI Store
// ============================================
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // ========== 初始状态 ==========
      sidebarOpen: true,
      statsDashboardOpen: false,
      theme: "light",
      isMobile: false,

      // ========== 状态操作方法 ==========

      /**
       * 切换侧边栏状态
       * 如果打开则关闭，如果关闭则打开
       */
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      /**
       * 设置侧边栏状态
       * 参数：open - true 打开，false 关闭
       */
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      /**
       * 切换统计仪表板状态
       * 如果打开则关闭，如果关闭则打开
       */
      toggleStatsDashboard: () => {
        set((state) => ({ statsDashboardOpen: !state.statsDashboardOpen }));
      },

      /**
       * 设置统计仪表板状态
       * 参数：open - true 打开，false 关闭
       */
      setStatsDashboardOpen: (open) => {
        set({ statsDashboardOpen: open });
      },

      /**
       * 设置主题
       * 同时更新 HTML 元素的 class，以应用相应的样式
       */
      setTheme: (theme) => {
        set({ theme });
        // 在浏览器环境中应用主题到 DOM
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      /**
       * 切换主题
       * 在浅色和深色主题之间切换
       */
      toggleTheme: () => {
        set((state) => {
          // 计算新主题
          const newTheme = state.theme === "light" ? "dark" : "light";
          // 在浏览器环境中应用新主题到 DOM
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newTheme === "dark");
          }
          return { theme: newTheme };
        });
      },

      /**
       * 设置是否为移动设备
       * 用于响应式设计，根据屏幕大小调整 UI
       */
      setIsMobile: (isMobile) => {
        set({ isMobile });
      },
    }),
    {
      // ========== 持久化配置 ==========
      // localStorage 中的存储键名
      name: "ui-storage",
      // 只持久化主题和侧边栏状态
      // isMobile 不持久化，因为它是动态计算的
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
