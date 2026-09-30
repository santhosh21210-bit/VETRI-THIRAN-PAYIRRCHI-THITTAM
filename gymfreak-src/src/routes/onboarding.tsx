import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useStore } from "../lib/store";
import type { FitnessLevel, Goal, Profile } from "../lib/fitness";
import { goalLabel, levelLabel } from "../lib/fitness";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — GymFreak" },
      { name: "description", content: "Set up your GymFreak profile to get personalized workout and nutrition plans." },
      { property: "og:title", content: "Get started — GymFreak" },
      { property: "og:description", content: "Set up your profile for personalized fitness plans." },
    ],
  }),
  component: OnboardingPage,
});

const GOALS: Goal[] = ["weight_loss", "muscle_gain", "fat_loss", "strength", "endurance", "general"];
const LEVELS: FitnessLevel[] = ["beginner", "intermediate", "advanced"];

function OnboardingPage() {
  const { setProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "25",
    gender: "male" as Profile["gender"],
    heightCm: "175",
    weightKg: "75",
    targetWeightKg: "",
    level: "beginner" as FitnessLevel,
    goal: "muscle_gain" as Goal,
    daysPerWeek: 4,
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const finish = () => {
    setProfile({
      name: form.name.trim() || "Athlete",
      age: Number(form.age) || 25,
      gender: form.gender,
      heightCm: Number(form.heightCm) || 175,
      weightKg: Number(form.weightKg) || 75,
      targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : undefined,
      level: form.level,
      goal: form.goal,
      daysPerWeek: form.daysPerWeek,
    });
    navigate({ to: "/" });
  };

  const steps = ["About you", "Your body", "Your goal"];

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome to GymFreak</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Let's build your plan</h1>
        <div className="mt-5 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
              <p className={`mt-2 text-[11px] font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-rise rounded-3xl border border-border bg-card p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="What should we call you?">
              <input
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Age">
              <input
                type="number"
                value={form.age}
                onChange={(e) => set({ age: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Gender">
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => set({ gender: g })}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${
                      form.gender === g ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)">
                <input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => set({ heightCm: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => set({ weightKg: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
            <Field label="Target weight (kg, optional)">
              <input
                type="number"
                value={form.targetWeightKg}
                onChange={(e) => set({ targetWeightKg: e.target.value })}
                placeholder="e.g. 80"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Training days per week">
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => set({ daysPerWeek: d })}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                      form.daysPerWeek === d ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Current fitness level">
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => set({ level: l })}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      form.level === l ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                    }`}
                  >
                    {levelLabel(l)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Main goal">
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => set({ goal: g })}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      form.goal === g ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                    }`}
                  >
                    {goalLabel(g)}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-0"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <Check className="size-4" /> Build my plan
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
