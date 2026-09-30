import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Droplets, Flame, Dumbbell, TrendingDown, MessageSquareText, ArrowRight } from "lucide-react";
import { useStore, todayKey } from "../lib/store";
import { nutritionPlan, workoutPlan, goalLabel, levelLabel, bmi } from "../lib/fitness";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymFreak — AI Fitness Assistant" },
      {
        name: "description",
        content: "Your AI fitness dashboard: daily goals, workouts, nutrition and progress in one place.",
      },
      { property: "og:title", content: "GymFreak — AI Fitness Assistant" },
      { property: "og:description", content: "Daily goals, personalized plans and an AI coach." },
    ],
  }),
  component: Dashboard,
});

function Ring({ pct, size = 120, stroke = 10, color = "var(--color-primary)", label, value }: {
  pct: number; size?: number; stroke?: number; color?: string; label: string; value: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="ring-progress">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-secondary)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(1, pct))}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-xl font-bold">{value}</div>
          </div>
        </div>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function Dashboard() {
  const { state, addWater } = useStore();
  const navigate = useNavigate();
  const profile = state.profile;

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("gymfreak-state-v1")) {
      navigate({ to: "/onboarding" });
    }
  }, [navigate]);

  if (!profile) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary font-display text-3xl font-bold text-primary-foreground">G</span>
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Train smarter with GymFreak</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Personalized workout plans, nutrition targets and an AI coach that adapts to your goals.
        </p>
        <Link
          to="/onboarding"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Build my plan <ArrowRight className="size-4" />
        </Link>
      </main>
    );
  }

  const today = todayKey();
  const plan = workoutPlan(profile);
  const nutrition = nutritionPlan(profile);
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysWorkout = plan.find((d) => d.day === dayName) ?? plan[0]!;
  const workoutDone = state.workoutsDone[`${today}:${todaysWorkout.title}`] ?? false;
  const waterMl = state.water[today] ?? 0;
  const waterTargetMl = nutrition.waterLiters * 1000;
  const caloriesEaten = state.calories[today] ?? 0;

  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const dayName2 = d.toLocaleDateString("en-US", { weekday: "long" });
    const w = plan.find((p) => p.day === dayName2);
    const done = w ? (state.workoutsDone[`${key}:${w.title}`] ?? false) : false;
    return { label, done, isToday: key === today };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {dayName} · {goalLabel(profile.goal)} · {levelLabel(profile.level)}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Let's get it, {profile.name}.
        </h1>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="animate-rise rounded-3xl border border-border bg-card p-6 lg:col-span-2" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Today's goals</h2>
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-around gap-6">
            <Ring
              pct={workoutDone ? 1 : 0.15}
              value={workoutDone ? "Done" : "1 left"}
              label="Workout"
              color="var(--color-primary)"
            />
            <Ring
              pct={caloriesEaten / nutrition.calories}
              value={`${caloriesEaten}`}
              label={`of ${nutrition.calories} kcal`}
              color="var(--color-cyan-glow)"
            />
            <Ring
              pct={waterMl / waterTargetMl}
              value={`${(waterMl / 1000).toFixed(1)}L`}
              label={`of ${nutrition.waterLiters}L water`}
              color="var(--color-magenta-glow)"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => addWater(today, 250)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary"
            >
              <Droplets className="size-3.5" /> +250ml water
            </button>
            <Link
              to="/nutrition"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary"
            >
              <Flame className="size-3.5" /> Log food
            </Link>
            <Link
              to="/workouts"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <Dumbbell className="size-3.5" /> {workoutDone ? "Review workout" : "Start workout"}
            </Link>
          </div>
        </section>

        <section className="animate-rise rounded-3xl border border-border bg-card p-6" style={{ animationDelay: "120ms" }}>
          <h2 className="font-display text-lg font-semibold">This week</h2>
          <div className="mt-5 flex items-end justify-between gap-2">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-lg transition-all ${
                    d.done ? "bg-primary" : d.isToday ? "bg-primary/25 ring-1 ring-primary" : "bg-secondary"
                  }`}
                  style={{ height: d.done ? 72 : 36 }}
                />
                <span className={`text-[10px] font-semibold ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>{d.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs text-muted-foreground">Body weight</p>
            <p className="font-display mt-1 text-2xl font-bold">
              {profile.weightKg}
              <span className="text-sm font-medium text-muted-foreground"> kg</span>
            </p>
            {profile.targetWeightKg && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                <TrendingDown className="size-3.5" /> Target {profile.targetWeightKg} kg
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">BMI {bmi(profile)}</p>
          </div>
        </section>

        <section className="animate-rise rounded-3xl border border-border bg-card p-6 lg:col-span-2" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Next up · {todaysWorkout.day}</p>
              <h2 className="font-display mt-1 text-lg font-semibold">{todaysWorkout.title}</h2>
              <p className="text-xs text-muted-foreground">{todaysWorkout.focus}</p>
            </div>
            <Link to="/workouts" className="text-xs font-semibold text-primary hover:underline">
              Full plan →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {todaysWorkout.exercises.slice(0, 4).map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm">
                <span>{e.name}</span>
                <span className="font-display font-semibold text-primary">
                  {e.sets} × {e.reps}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Link
          to="/coach"
          className="animate-rise group relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 transition hover:border-primary/60"
          style={{ animationDelay: "240ms" }}
        >
          <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse-dot" /> AI Coach · online
            </div>
            <h2 className="font-display mt-2 text-lg font-semibold">Ask your coach anything</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              "Should I deload this week?" — get advice tuned to your profile.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <MessageSquareText className="size-4" /> Open chat
            </span>
          </div>
        </Link>
      </div>
    </main>
  );
}
