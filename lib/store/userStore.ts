import { create } from "zustand";
import type {
  XboardUser,
  XboardSubscribe,
  XboardServer,
  XboardNotice,
  XboardPlan,
  XboardConfig,
  XboardTicket,
} from "@/types/xboard";

interface UserState {
  authenticated: boolean;
  user: XboardUser | null;
  subscribe: XboardSubscribe | null;
  servers: XboardServer[];
  notices: XboardNotice[];
  plans: XboardPlan[];
  tickets: XboardTicket[];
  config: XboardConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  setUser: (user: XboardUser | null) => void;
  updateUser: (partial: Partial<XboardUser>) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  authenticated: false,
  user: null,
  subscribe: null,
  servers: [],
  notices: [],
  plans: [],
  tickets: [],
  config: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/xboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();
      const isAuthenticated = Boolean(data.authenticated && data.user);

      set({
        authenticated: isAuthenticated,
        user: data.user,
        subscribe: data.subscribe,
        servers: data.servers || [],
        notices: data.notices || [],
        plans: data.plans || [],
        tickets: data.tickets || [],
        config: data.config || null,
        isLoading: false,
      });

      // If user is not authenticated and is on a dashboard route, redirect to login
      if (!isAuthenticated && typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (!pathname.includes("/login")) {
          const match = pathname.match(/^\/(zh-CN|en-US|ja-JP|ko-KR)/);
          const currentLocale = match ? match[1] : "zh-CN";
          window.location.href = `/${currentLocale}/login`;
        }
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  logout: async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    set({
      authenticated: false,
      user: null,
      subscribe: null,
      servers: [],
      notices: [],
      plans: [],
      tickets: [],
      config: null,
      isLoading: false,
      error: null,
    });

    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (!pathname.includes("/login")) {
        const match = pathname.match(/^\/(zh-CN|en-US|ja-JP|ko-KR)/);
        const currentLocale = match ? match[1] : "zh-CN";
        window.location.href = `/${currentLocale}/login`;
      }
    }
  },
}));