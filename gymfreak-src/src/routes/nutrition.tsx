import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Plus } from "lucide-react";
import { useStore, todayKey } from "../lib/store";
import { nutritionPlan } from "../lib/fitness";
import { NeedProfile } from "./workouts";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — GymFreak" },
      { name: "description", content: "Your daily calorie and macro targets with a personalized meal plan and water tracking." },
      { property: "og:title", content: "Nutrition — GymFreak" },
      { property: "og:description", content: "Daily macro targets, meal plan and water tracking." },
    ],
  }),
  component: NutritionPage,
});

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, target)) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {value} / {target} g
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function NutritionPage() {
  const { state, addWater, addCalories } = useStore();
  const profile = state.profile;
  const [kcalInput, setKcalInput] = useState("");

  if (!profile) return <NeedProfile />;

  const plan = nutritionPlan(profile);
  const today = todayKey();
  const waterMl = state.water[today] ?? 0;
  const waterTargetMl = plan.waterLiters * 1000;
  const eaten = state.calories[today] ?? 0;
  const glasses = Math.round(waterTargetMl / 250);
  const filled = Math.floor(waterMl / 250);

  // Rough macro estimate proportional to calories logged
  const ratio = Math.min(1, eaten / plan.calories);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fuel</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Nutrition</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="animate-rise rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Daily targets</h2>
          <p className="font-display mt-3 text-4xl font-bold">
            {plan.calories}
            <span className="text-base font-medium text-muted-foreground"> kcal</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Logged today: {eaten} kcal</p>
          <div className="mt-5 space-y-4">
            <MacroBar label="Protein" value={Math.round(plan.protein * ratio)} target={plan.protein} color="var(--color-primary)" />
            <MacroBar label="Carbs" value={Math.round(plan.carbs * ratio)} target={plan.carbs} color="var(--color-cyan-glow)" />
            <MacroBar label="Fat" value={Math.round(plan.fat * ratio)} target={plan.fat} color="var(--color-magenta-glow)" />
          </div>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const kcal = Number(kcalInput);
              if (kcal > 0) {
                addCalories(today, kcal);
                setKcalInput("");
              }
            }}
          >
            <input
              type="number"
              value={kcalInput}
              onChange={(e) => setKcalInput(e.target.value)}
              placeholder="Log calories eaten"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" /> Add
            </button>
          </form>
        </section>

        <section className="animate-rise rounded-3xl border border-border bg-card p-6" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Water</h2>
            <span className="text-xs text-muted-foreground">
              {(waterMl / 1000).toFixed(2)} / {plan.waterLiters}L
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {Array.from({ length: glasses }).map((_, i) => (
              <div
                key={i}
                className={`h-8 w-3 rounded-full transition-colors ${i < filled ? "bg-cyan-glow" : "bg-secondary"}`}
              />
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => addWater(today, 250)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Droplets className="size-3.5" /> +250ml
            </button>
            <button
              onClick={() => addWater(today, -250)}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              −250ml
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Target is based on your body weight ({profile.weightKg} kg × 40ml).
          </p>
        </section>
      </div>

      <section className="animate-rise mt-4 rounded-3xl border border-border bg-card p-6" style={{ animationDelay: "160ms" }}>
        <h2 className="font-display text-lg font-semibold">Today's meal plan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plan.meals.map((m) => (
            <div key={m.name} className="rounded-2xl bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">{m.name}</p>
                <span className="text-xs font-semibold text-primary">{m.calories} kcal</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">≈ {m.protein}g protein</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
