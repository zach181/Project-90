import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Challenge, Commitment, NewChallengeInput } from "../types";
import { uid } from "../utils/id";
import { todayISO } from "../utils/date";
import { useLogStore } from "./logStore";

interface ChallengeState {
  challenge: Challenge | null;
  hydrated: boolean;
  createChallenge: (input: NewChallengeInput) => void;
  updateChallenge: (patch: Partial<Omit<Challenge, "id" | "createdAt">>) => void;
  addCommitment: (c: Omit<Commitment, "id">) => void;
  updateCommitment: (id: string, patch: Partial<Omit<Commitment, "id">>) => void;
  removeCommitment: (id: string) => void;
  /** keep the challenge definition, wipe progress, start again from today */
  restart: () => void;
  /** delete everything and go back to onboarding */
  deleteChallenge: () => void;
}

function withIds(commitments: Array<Omit<Commitment, "id">>): Commitment[] {
  return commitments.map((c) => ({ ...c, id: uid("cmt") }));
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenge: null,
      hydrated: false,

      createChallenge: (input) => {
        useLogStore.getState().clearAll();
        set({
          challenge: {
            id: uid("chg"),
            name: input.name.trim() || "My 90",
            startDate: todayISO(),
            totalDays: input.totalDays ?? 90,
            commitments: withIds(input.commitments),
            missRule: input.missRule,
            graceDays: input.graceDays ?? 0,
            createdAt: Date.now(),
          },
        });
      },

      updateChallenge: (patch) => {
        const current = get().challenge;
        if (!current) return;
        set({ challenge: { ...current, ...patch } });
      },

      addCommitment: (c) => {
        const current = get().challenge;
        if (!current) return;
        set({
          challenge: {
            ...current,
            commitments: [...current.commitments, { ...c, id: uid("cmt") }],
          },
        });
      },

      updateCommitment: (id, patch) => {
        const current = get().challenge;
        if (!current) return;
        set({
          challenge: {
            ...current,
            commitments: current.commitments.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          },
        });
      },

      removeCommitment: (id) => {
        const current = get().challenge;
        if (!current) return;
        set({
          challenge: {
            ...current,
            commitments: current.commitments.filter((c) => c.id !== id),
          },
        });
      },

      restart: () => {
        const current = get().challenge;
        if (!current) return;
        useLogStore.getState().clearAll();
        set({
          challenge: {
            ...current,
            id: uid("chg"),
            startDate: todayISO(),
            createdAt: Date.now(),
          },
        });
      },

      deleteChallenge: () => {
        useLogStore.getState().clearAll();
        set({ challenge: null });
      },
    }),
    {
      name: "project90-challenge",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ challenge: state.challenge }),
      onRehydrateStorage: () => () => {
        useChallengeStore.setState({ hydrated: true });
      },
    }
  )
);
