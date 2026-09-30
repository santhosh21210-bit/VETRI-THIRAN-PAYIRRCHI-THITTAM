import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Scale } from "lucide-react";
import { useStore, todayKey } from "../lib/store";
import { bmi, goalLabel, workoutPlan } from "../lib/fitness";
import { NeedProfile } from "./workouts";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — GymFreak" },
      { name: "description", content: "Track your body weight, workout consistency and weekly progress summary." },
      { property: "og:title", content: "Progress — GymFreak" },
      { property: "og:description", content: "Weight tracking and weekly fitness progress summary." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { state, addWeight } = useStore();
  const profile = state.profile;
  const [kg, setKg] = useState("");

  if (!profile) return <NeedProfile />;

  const plan = workoutPlan(profile);
  const today = todayKey();

  const entries = state.weights.length
    ? state.weights
    : [{ date: today, kg: profile.weightKg }];
  const first = entries[0]?.kg ?? profile.weightKg;
  const last = entries[entries.length - 1]?.kg ?? profile.weightKg;
  const delta = Math.round((last - first) * 10) / 10;
  const min = Math.min(...entries.map((e) => e.kg));
  const max = Math.max(...entries.map((e) => e.kg));
  const range = Math.max(0.5, max - min);

  const weekWorkouts = [...Array(7)].filter((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const w = plan.find((p) => p.day === dayName);
    return w ? state.workoutsDone[`${key}:${w.title}`] : false;
  }).length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Progress</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Your journey</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="animate-rise rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current weight</p>
          <p className="font-display mt-2 text-3xl font-bold">
            {last}
            <span className="text-sm font-medium text-muted-foreground"> kg</span>
          </p>
          <p className={`mt-1 text-xs font-semibold ${delta <= 0 ? "text-primary" : "text-magenta-glow"}`}>
            {delta <= 0 ? "▼" : "▲"} {Math.abs(delta)} kg since start
          </p>
        </div>
        <div className="animate-rise rounded-3xl border border-border bg-card p-5" style={{ animationDelay: "60ms" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workouts this week</p>
          <p className="font-display mt-2 text-3xl font-bold">
            {weekWorkouts}
            <span className="text-sm font-medium text-muted-foreground"> / {profile.daysPerWeek}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Goal: {goalLabel(profile.goal)}</p>
        </div>
        <div className="animate-rise rounded-3xl border border-border bg-card p-5" style={{ animationDelay: "120ms" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">BMI</p>
          <p className="font-display mt-2 text-3xl font-bold">{bmi(profile)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {profile.targetWeightKg ? `Target: ${profile.targetWeightKg} kg` : "No target set"}
          </p>
        </div>
      </div>

      <section className="animate-rise mt-4 rounded-3xl border border-border bg-card p-6" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Body weight</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = Number(kg);
              if (v > 20 && v < 400) {
                addWeight(v);
                setKg("");
              }
            }}
          >
            <input
              type="number"
              step="0.1"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              placeholder="kg"
              className="w-24 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="size-3.5" /> Log
            </button>
          </form>
        </div>

        <div className="mt-6 flex h-40 items-end gap-2">
          {entries.slice(-14).map((e, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">{e.kg}</span>
              <div
                className="w-full rounded-t-md bg-primary/80"
                style={{ height: `${20 + ((e.kg - min) / range) * 80}%` }}
                title={`${e.date}: ${e.kg} kg`}
              />
              <span className="text-[9px] text-muted-foreground">{e.date.slice(5)}</span>
            </div>
          ))}
        </div>
        {entries.length <= 1 && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Scale className="size-4" /> Log your weight regularly to see your trend here.
          </p>
        )}
      </section>

      <section className="animate-rise mt-4 rounded-3xl border border-primary/30 bg-card p-6" style={{ animationDelay: "240ms" }}>
        <h2 className="font-display text-lg font-semibold">Weekly summary</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You completed <span className="font-semibold text-foreground">{weekWorkouts}</span> of{" "}
          <span className="font-semibold text-foreground">{profile.daysPerWeek}</span> planned sessions this week
          {delta !== 0 && (
            <>
              {" "}and your weight moved <span className="font-semibold text-foreground">{Math.abs(delta)} kg</span>{" "}
              {delta < 0 ? "down" : "up"}
            </>
          )}
          .{" "}
          {weekWorkouts >= profile.daysPerWeek
            ? "Outstanding consistency — keep this momentum going next week."
            : "Try to hit every planned session next week — consistency beats intensity."}
        </p>
      </section>
    </main>
  );
}
