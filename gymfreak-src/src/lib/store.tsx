import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile } from "./fitness";

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface AppState {
  profile: Profile | null;
  water: Record<string, number>; // date -> ml
  calories: Record<string, number>; // date -> kcal eaten
  workoutsDone: Record<string, boolean>; // "date:dayTitle" -> done
  weights: WeightEntry[];
}

const EMPTY: AppState = { profile: null, water: {}, calories: {}, workoutsDone: {}, weights: [] };
const KEY = "gymfreak-state-v1";

function load(): AppState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

interface Store {
  state: AppState;
  setProfile: (p: Profile) => void;
  addWater: (date: string, ml: number) => void;
  addCalories: (date: string, kcal: number) => void;
  toggleWorkout: (key: string) => void;
  addWeight: (kg: number) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    }
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      state,
      setProfile: (p) => setState((s) => ({ ...s, profile: p })),
      addWater: (date, ml) =>
        setState((s) => ({ ...s, water: { ...s.water, [date]: Math.max(0, (s.water[date] ?? 0) + ml) } })),
      addCalories: (date, kcal) =>
        setState((s) => ({ ...s, calories: { ...s.calories, [date]: Math.max(0, (s.calories[date] ?? 0) + kcal) } })),
      toggleWorkout: (key) =>
        setState((s) => {
          const next = { ...s.workoutsDone };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { ...s, workoutsDone: next };
        }),
      addWeight: (kg) =>
        setState((s) => ({
          ...s,
          weights: [...s.weights, { date: todayKey(), kg }].slice(-60),
        })),
      reset: () => setState(EMPTY),
    }),
    [state],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}
