import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DayLog, EntryValue } from "../types";

interface LogState {
  /** keyed by yyyy-MM-dd */
  logs: Record<string, DayLog>;
  hydrated: boolean;
  setEntry: (
    date: string,
    dayNumber: number,
    commitmentId: string,
    value: EntryValue | null
  ) => void;
  setNote: (date: string, dayNumber: number, note: string) => void;
  lockDay: (date: string, dayNumber: number) => void;
  unlockDay: (date: string) => void;
  clearAll: () => void;
}

function ensureDay(logs: Record<string, DayLog>, date: string, dayNumber: number): DayLog {
  return logs[date] ?? { date, dayNumber, entries: {} };
}

export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      logs: {},
      hydrated: false,

      setEntry: (date, dayNumber, commitmentId, value) =>
        set((state) => {
          const day = ensureDay(state.logs, date, dayNumber);
          const entries = { ...day.entries };
          if (value === null) delete entries[commitmentId];
          else entries[commitmentId] = value;
          return { logs: { ...state.logs, [date]: { ...day, dayNumber, entries } } };
        }),

      setNote: (date, dayNumber, note) =>
        set((state) => {
          const day = ensureDay(state.logs, date, dayNumber);
          return { logs: { ...state.logs, [date]: { ...day, dayNumber, note } } };
        }),

      lockDay: (date, dayNumber) =>
        set((state) => {
          const day = ensureDay(state.logs, date, dayNumber);
          return {
            logs: { ...state.logs, [date]: { ...day, dayNumber, lockedAt: Date.now() } },
          };
        }),

      unlockDay: (date) =>
        set((state) => {
          const day = state.logs[date];
          if (!day) return state;
          const { lockedAt: _lockedAt, ...rest } = day;
          return { logs: { ...state.logs, [date]: rest } };
        }),

      clearAll: () => set({ logs: {} }),
    }),
    {
      name: "project90-logs",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ logs: state.logs }),
      onRehydrateStorage: () => () => {
        useLogStore.setState({ hydrated: true });
      },
    }
  )
);
