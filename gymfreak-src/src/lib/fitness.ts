export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Goal = "weight_loss" | "muscle_gain" | "fat_loss" | "strength" | "endurance" | "general";

export interface Profile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  level: FitnessLevel;
  goal: Goal;
  daysPerWeek: number;
  targetWeightKg?: number | undefined;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  note?: string;
}

export interface WorkoutDay {
  day: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterLiters: number;
  meals: Meal[];
}

export function bmi(p: Profile): number {
  const m = p.heightCm / 100;
  return Math.round((p.weightKg / (m * m)) * 10) / 10;
}

export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.gender === "female" ? base - 161 : base + 5);
}

export function tdee(p: Profile): number {
  const factor = 1.35 + p.daysPerWeek * 0.075;
  return Math.round(bmr(p) * Math.min(factor, 1.9));
}

export function calorieTarget(p: Profile): number {
  const t = tdee(p);
  switch (p.goal) {
    case "weight_loss":
    case "fat_loss":
      return Math.max(1200, t - 450);
    case "muscle_gain":
    case "strength":
      return t + 300;
    default:
      return t;
  }
}

export function nutritionPlan(p: Profile): NutritionPlan {
  const calories = calorieTarget(p);
  const proteinPerKg = p.goal === "muscle_gain" || p.goal === "strength" ? 2.0 : p.goal === "fat_loss" || p.goal === "weight_loss" ? 1.8 : 1.6;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const waterLiters = Math.round(p.weightKg * 0.04 * 10) / 10;

  const meals: Meal[] = [
    { name: "Breakfast", description: "Oats with whey, banana and peanut butter", calories: Math.round(calories * 0.25), protein: Math.round(protein * 0.25) },
    { name: "Lunch", description: "Grilled chicken, rice and mixed vegetables", calories: Math.round(calories * 0.3), protein: Math.round(protein * 0.3) },
    { name: "Snack", description: "Greek yogurt with berries and almonds", calories: Math.round(calories * 0.15), protein: Math.round(protein * 0.15) },
    { name: "Dinner", description: "Salmon or paneer, sweet potato and salad", calories: Math.round(calories * 0.3), protein: Math.round(protein * 0.3) },
  ];

  return { calories, protein, carbs, fat, waterLiters, meals };
}

const SPLIT: Record<string, { title: string; focus: string; exercises: Exercise[] }> = {
  push: {
    title: "Push Day",
    focus: "Chest · Shoulders · Triceps",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6–8" },
      { name: "Overhead Press", sets: 3, reps: "8–10" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10–12" },
      { name: "Lateral Raises", sets: 3, reps: "12–15" },
      { name: "Triceps Rope Pushdown", sets: 3, reps: "12–15" },
    ],
  },
  pull: {
    title: "Pull Day",
    focus: "Back · Biceps · Rear Delts",
    exercises: [
      { name: "Deadlift", sets: 3, reps: "5–6", note: "Warm up thoroughly" },
      { name: "Pull-Ups or Lat Pulldown", sets: 4, reps: "8–10" },
      { name: "Barbell Row", sets: 3, reps: "8–10" },
      { name: "Face Pulls", sets: 3, reps: "12–15" },
      { name: "Biceps Curls", sets: 3, reps: "10–12" },
    ],
  },
  legs: {
    title: "Leg Day",
    focus: "Quads · Hamstrings · Glutes · Calves",
    exercises: [
      { name: "Back Squat", sets: 4, reps: "6–8" },
      { name: "Romanian Deadlift", sets: 3, reps: "8–10" },
      { name: "Leg Press", sets: 3, reps: "10–12" },
      { name: "Walking Lunges", sets: 3, reps: "12 each" },
      { name: "Standing Calf Raises", sets: 4, reps: "12–15" },
    ],
  },
  upper: {
    title: "Upper Body",
    focus: "Chest · Back · Shoulders · Arms",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "6–8" },
      { name: "Bent-Over Row", sets: 4, reps: "8–10" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–10" },
      { name: "Lat Pulldown", sets: 3, reps: "10–12" },
      { name: "Dips", sets: 3, reps: "to failure" },
    ],
  },
  lower: {
    title: "Lower Body",
    focus: "Legs · Core",
    exercises: [
      { name: "Squat", sets: 4, reps: "6–8" },
      { name: "Hip Thrust", sets: 3, reps: "8–10" },
      { name: "Leg Curl", sets: 3, reps: "10–12" },
      { name: "Plank", sets: 3, reps: "60 sec" },
      { name: "Hanging Leg Raises", sets: 3, reps: "10–12" },
    ],
  },
  full: {
    title: "Full Body",
    focus: "Compound strength circuit",
    exercises: [
      { name: "Squat", sets: 3, reps: "8" },
      { name: "Bench Press", sets: 3, reps: "8" },
      { name: "Barbell Row", sets: 3, reps: "8" },
      { name: "Overhead Press", sets: 2, reps: "10" },
      { name: "Plank", sets: 3, reps: "45 sec" },
    ],
  },
  cardio: {
    title: "Cardio & Core",
    focus: "Conditioning · Abs",
    exercises: [
      { name: "Incline Treadmill Walk / Run", sets: 1, reps: "25 min" },
      { name: "Kettlebell Swings", sets: 4, reps: "15" },
      { name: "Mountain Climbers", sets: 3, reps: "40 sec" },
      { name: "Russian Twists", sets: 3, reps: "20" },
    ],
  },
};

export function workoutPlan(p: Profile): WorkoutDay[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let keys: string[];
  if (p.daysPerWeek <= 3) keys = ["full", "full", "full"];
  else if (p.daysPerWeek === 4) keys = ["upper", "lower", "upper", "lower"];
  else if (p.daysPerWeek === 5) keys = ["push", "pull", "legs", "upper", "cardio"];
  else keys = ["push", "pull", "legs", "push", "pull", "legs"];

  if (p.goal === "weight_loss" || p.goal === "endurance") {
    keys = keys.map((k, i) => (i === keys.length - 1 ? "cardio" : k));
  }

  const scale = p.level === "beginner" ? -1 : p.level === "advanced" ? 1 : 0;

  return keys.map((k, i) => {
    const t = SPLIT[k] ?? SPLIT["full"]!;
    return {
      day: days[i] ?? `Day ${i + 1}`,
      title: t.title,
      focus: t.focus,
      exercises: t.exercises.map((e) => ({
        ...e,
        sets: Math.max(2, e.sets + scale),
      })),
    };
  });
}

export function goalLabel(g: Goal): string {
  return {
    weight_loss: "Weight loss",
    muscle_gain: "Muscle gain",
    fat_loss: "Fat loss",
    strength: "Strength",
    endurance: "Endurance",
    general: "General fitness",
  }[g];
}

export function levelLabel(l: FitnessLevel): string {
  return l.charAt(0).toUpperCase() + l.slice(1);
}
