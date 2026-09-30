import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { useStore, todayKey } from "../lib/store";
import { workoutPlan } from "../lib/fitness";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workout plan — GymFreak" },
      { name: "description", content: "Your personalized weekly workout plan, generated from your goals and fitness level." },
      { property: "og:title", content: "Workout plan — GymFreak" },
      { property: "og:description", content: "Your personalized weekly workout plan." },
    ],
  }),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { state, toggleWorkout } = useStore();
  const profile = state.profile;

  if (!profile) {
    return <NeedProfile />;
  }

  const plan = workoutPlan(profile);
  const today = todayKey();
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Weekly plan</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Your workouts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {profile.daysPerWeek} training days per week, tuned to your {profile.level} level. Tap a day to mark it done.
      </p>

      <div className="mt-8 space-y-4">
        {plan.map((day, i) => {
          const key = `${today}:${day.title}`;
          const done = state.workoutsDone[key] ?? false;
          const isToday = day.day === dayName;
          return (
            <section
              key={day.day}
              className={`animate-rise rounded-3xl border bg-card p-6 ${isToday ? "border-primary/50" : "border-border"}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{day.day}</p>
                    {isToday && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Today
                      </span>
                    )}
                  </div>
                  <h2 className="font-display mt-1 text-xl font-semibold">{day.title}</h2>
                  <p className="text-xs text-muted-foreground">{day.focus}</p>
                </div>
                <button
                  onClick={() => toggleWorkout(key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  {done ? "Done" : "Mark done"}
                </button>
              </div>
              <div className="mt-4 divide-y divide-border">
                {day.exercises.map((e) => (
                  <div key={e.name} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <span>{e.name}</span>
                      {e.note && <span className="ml-2 text-xs text-muted-foreground">· {e.note}</span>}
                    </div>
                    <span className="font-display shrink-0 font-semibold text-primary">
                      {e.sets} × {e.reps}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

export function NeedProfile() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Set up your profile first</h1>
      <p className="mt-2 text-sm text-muted-foreground">GymFreak personalizes everything from your profile and goals.</p>
      <Link
        to="/onboarding"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Start onboarding
      </Link>
    </main>
  );
}
