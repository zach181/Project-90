import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";
import { useProfileStore } from "./profileStore";
import type { Group } from "../types";

interface StatsPush {
  dayNumber: number;
  totalDays: number;
  streak: number;
  challengeName: string;
}

interface GroupState {
  groupId: string | null;
  group: Group | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  createGroup: (name: string) => Promise<boolean>;
  joinGroup: (code: string) => Promise<boolean>;
  refreshGroup: () => Promise<void>;
  leaveGroup: () => Promise<void>;
  syncStats: (stats: StatsPush) => Promise<void>;
  clearError: () => void;
}

function authHeaders(): Record<string, string> {
  const token = useProfileStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groupId: null,
      group: null,
      hydrated: false,
      loading: false,
      error: null,

      createGroup: async (name) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/api/groups`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ name }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Could not create the group.");
          set({ groupId: data.id, group: data, loading: false });
          return true;
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Couldn't reach the Groups server." });
          return false;
        }
      },

      joinGroup: async (code) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/api/groups/join`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ code: code.trim().toUpperCase() }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Could not join that group.");
          set({ groupId: data.id, group: data, loading: false });
          return true;
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Couldn't reach the Groups server." });
          return false;
        }
      },

      refreshGroup: async () => {
        const id = get().groupId;
        if (!id) return;
        try {
          const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, { headers: authHeaders() });
          const data = await res.json();
          if (res.ok) set({ group: data });
        } catch {
          // best-effort — keep the last known group state
        }
      },

      leaveGroup: async () => {
        const id = get().groupId;
        if (!id) return;
        try {
          await fetch(`${API_BASE_URL}/api/groups/${id}/leave`, {
            method: "POST",
            headers: authHeaders(),
          });
        } catch {
          // ignore — clear locally regardless
        }
        set({ groupId: null, group: null });
      },

      syncStats: async (stats) => {
        if (!useProfileStore.getState().token) return;
        try {
          await fetch(`${API_BASE_URL}/api/users/me/stats`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(stats),
          });
          if (get().groupId) get().refreshGroup();
        } catch {
          // best-effort — a missed sync isn't fatal, it'll retry next lock-in
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "project90-group",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ groupId: s.groupId, group: s.group }),
      onRehydrateStorage: () => () => {
        useGroupStore.setState({ hydrated: true });
      },
    }
  )
);
