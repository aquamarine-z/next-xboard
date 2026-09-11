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
      set({
        authenticated: Boolean(data.authenticated),
        user: data.user,
        subscribe: data.subscribe,
        servers: data.servers || [],
        notices: data.notices || [],
        plans: data.plans || [],
        tickets: data.tickets || [],
        config: data.config || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

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
  },
}));