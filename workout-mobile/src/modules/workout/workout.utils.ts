import type { Workout } from './workout.slice';

const normalizeDate = (value: any): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

const dateKey = (value: Date): string => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized.toISOString().split('T')[0];
};

export const deriveDashboardSummary = (
  workouts: Workout[],
): {
  totalWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  completedWorkouts: number;
  currentStreak: number;
  workoutsToday: number;
  totalCaloriesBurned: number;
} => {
  const completedWorkouts = (workouts ?? []).filter(workout => workout?.isCompleted);

  const today = new Date();
  const todayKey = dateKey(today);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const workoutDays = new Set<string>();

  let workoutsToday = 0;
  let weeklyWorkouts = 0;
  let monthlyWorkouts = 0;
  let totalCalories = 0;
  let totalDuration = 0;

  completedWorkouts.forEach(workout => {
    const date = normalizeDate(workout.date);
    const key = dateKey(date);
    workoutDays.add(key);

    if (key === todayKey) {
      workoutsToday += 1;
    }
    if (date >= sevenDaysAgo) {
      weeklyWorkouts += 1;
    }
    if (date >= thirtyDaysAgo) {
      monthlyWorkouts += 1;
    }
    totalCalories += workout.caloriesBurned ?? 0;
    totalDuration += workout.totalDuration ?? 0;
  });

  let currentStreak = 0;
  const cursor = new Date(today);
  while (workoutDays.has(dateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalWorkouts = completedWorkouts.length;

  return {
    totalWorkouts,
    weeklyWorkouts,
    monthlyWorkouts,
    totalCalories,
    totalDuration,
    completedWorkouts: totalWorkouts,
    currentStreak,
    workoutsToday,
    totalCaloriesBurned: totalCalories,
  };
};

