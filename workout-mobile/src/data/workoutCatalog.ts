export type CatalogTemplate = {
  key: string;
  name: string;
  description: string;
  focus: ("upper" | "lower" | "full" | "core" | "push" | "pull" | "glutes" | "arms" | "shoulders")[];
  equipment: ("bodyweight" | "dumbbell" | "band" | "kettlebell" | "barbell" | "cable" | "machine" | "any")[];
  goal: "strength" | "hypertrophy" | "fat-loss" | "mobility";
  duration: number; // minutes
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

// Mirrors backend catalog for consistent filtering and templating.
export const workoutCatalog: CatalogTemplate[] = [
  {
    key: "home_hiit_20",
    name: "Home HIIT 20",
    description: "Fast, no-equipment sweat session with explosive moves.",
    focus: ["full"],
    equipment: ["bodyweight"],
    goal: "fat-loss",
    duration: 20,
    difficulty: "Intermediate",
  },
  {
    key: "home_core_15",
    name: "Core Crush 15",
    description: "Planks, holds, and crunches to lock in your midline.",
    focus: ["core"],
    equipment: ["bodyweight"],
    goal: "strength",
    duration: 15,
    difficulty: "Beginner",
  },
  {
    key: "home_glutes_25",
    name: "Glutes & Legs at Home",
    description: "No-gear lower body burner with lunges, squats, and pulses.",
    focus: ["lower", "glutes"],
    equipment: ["bodyweight"],
    goal: "hypertrophy",
    duration: 25,
    difficulty: "Intermediate",
  },
  {
    key: "db_upper_30",
    name: "Dumbbell Upper 30",
    description: "Presses, rows, curls, and raises with a single pair of dumbbells.",
    focus: ["upper", "push", "pull", "arms", "shoulders"],
    equipment: ["dumbbell"],
    goal: "hypertrophy",
    duration: 30,
    difficulty: "Intermediate",
  },
  {
    key: "db_lower_30",
    name: "Dumbbell Legs & Glutes",
    description: "Goblets, lunges, hinges, and split squats for lower body strength.",
    focus: ["lower", "glutes"],
    equipment: ["dumbbell"],
    goal: "strength",
    duration: 30,
    difficulty: "Intermediate",
  },
  {
    key: "db_full_40",
    name: "Dumbbell Full Body 40",
    description: "Compound circuits to hit every major muscle group.",
    focus: ["full"],
    equipment: ["dumbbell"],
    goal: "strength",
    duration: 40,
    difficulty: "Advanced",
  },
  {
    key: "band_tone_25",
    name: "Band Tone 25",
    description: "High-tension band work for shoulders, back, and arms.",
    focus: ["upper", "pull", "arms", "shoulders"],
    equipment: ["band"],
    goal: "hypertrophy",
    duration: 25,
    difficulty: "Beginner",
  },
  {
    key: "band_glutes_20",
    name: "Band Glute Builder",
    description: "Abductions, bridges, and kickbacks to light up your posterior chain.",
    focus: ["lower", "glutes"],
    equipment: ["band"],
    goal: "hypertrophy",
    duration: 20,
    difficulty: "Intermediate",
  },
  {
    key: "gym_push_pull_45",
    name: "Push / Pull Gym 45",
    description: "Bench, rows, pulldowns, and presses for balanced upper strength.",
    focus: ["upper", "push", "pull", "shoulders", "arms"],
    equipment: ["barbell", "dumbbell", "cable", "machine"],
    goal: "strength",
    duration: 45,
    difficulty: "Intermediate",
  },
  {
    key: "gym_legs_strength_45",
    name: "Leg Day Strength",
    description: "Heavy squats, hinges, and machines to drive lower-body power.",
    focus: ["lower", "glutes"],
    equipment: ["barbell", "dumbbell", "machine"],
    goal: "strength",
    duration: 45,
    difficulty: "Advanced",
  },
  {
    key: "gym_upper_strength_60",
    name: "Upper Power Hour",
    description: "Long-form session with presses, rows, raises, and accessories.",
    focus: ["upper", "push", "pull", "shoulders", "arms"],
    equipment: ["barbell", "dumbbell", "cable", "machine"],
    goal: "hypertrophy",
    duration: 60,
    difficulty: "Advanced",
  },
  {
    key: "mobility_reset_15",
    name: "Mobility Reset",
    description: "Stretch and restore with controlled flows and openers.",
    focus: ["full"],
    equipment: ["bodyweight"],
    goal: "mobility",
    duration: 15,
    difficulty: "Beginner",
  },
];

export default workoutCatalog;
