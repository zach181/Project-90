import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

interface ProfileState {
  userId: string | null;
  token: string | null;
  name: string | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  /** Registers a new lightweight identity (name only, no password) if needed, or renames it. */
  ensureProfile: (name: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      userId: null,
      token: null,
      name: null,
      hydrated: false,
      loading: false,
      error: null,

      ensureProfile: async (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          set({ error: "Enter a name first." });
          return false;
        }
        set({ loading: true, error: null });
        try {
          const { userId, token } = get();
          if (userId && token) {
            const res = await fetch(`${API_BASE_URL}/api/users/me`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name: trimmed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error ?? "Could not update your name.");
            set({ name: data.name, loading: false });
            return true;
          }
          const res = await fetch(`${API_BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Could not create a profile.");
          set({ userId: data.userId, token: data.token, name: data.name, loading: false });
          return true;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Couldn't reach the Groups server. Is it running?",
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "project90-profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ userId: s.userId, token: s.token, name: s.name }),
      onRehydrateStorage: () => () => {
        useProfileStore.setState({ hydrated: true });
      },
    }
  )
);
