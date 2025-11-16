import { create } from "zustand";
import { StatsResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { handleAPIError } from "@/lib/errorHandler";

interface StatsState {
  stats: StatsResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchStats: () => Promise<void>;
  setStats: (stats: StatsResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const stats = await api.getStats();
      set({
        stats,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      const errorMessage = handleAPIError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Re-throw error so component can handle it with toast
      throw error;
    }
  },

  setStats: (stats) => {
    set({
      stats,
      lastUpdated: new Date(),
      error: null,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  reset: () => {
    set({
      stats: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },
}));
