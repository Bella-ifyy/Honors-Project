import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Exercise = {
  id: number;
  name: string;
  description?: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  targetMuscles?: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  mediaUrl?: string;
};

export type WorkoutExercise = {
  id: number;
  exerciseId: number;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  orderIndex: number;
  exercise?: Exercise;
};

export type Workout = {
  id: number;
  date: Date | string;
  name?: string;
  notes?: string;
  totalDuration: number;
  caloriesBurned: number;
  isCompleted: boolean;
  exercises: WorkoutExercise[];
};

export type WorkoutRoutine = {
  id: number;
  name: string;
  description?: string;
  scheduledDays: string[];
  isActive: boolean;
  exercises: any[];
};

export type Progress = {
  id: number;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  notes?: string;
  measurements?: any;
  photoUrl?: string;
};

export type DashboardSummary = {
  totalWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  completedWorkouts: number;
  currentStreak?: number;
  workoutsToday?: number;
  totalCaloriesBurned?: number;
};

interface WorkoutState {
  workouts: Workout[];
  exercises: Exercise[];
  routines: WorkoutRoutine[];
  progress: Progress[];
  dashboardSummary: DashboardSummary | null;
  currentWorkout: Workout | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: [],
  exercises: [],
  routines: [],
  progress: [],
  dashboardSummary: null,
  currentWorkout: null,
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkouts(state, action: PayloadAction<Workout[]>) {
      state.workouts = action.payload;
    },
    addWorkout(state, action: PayloadAction<Workout>) {
      state.workouts.unshift(action.payload);
    },
    updateWorkout(state, action: PayloadAction<Workout>) {
      const index = state.workouts.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workouts[index] = action.payload;
      }
    },
    deleteWorkout(state, action: PayloadAction<number>) {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
    },
    setCurrentWorkout(state, action: PayloadAction<Workout | null>) {
      state.currentWorkout = action.payload;
    },
    setExercises(state, action: PayloadAction<Exercise[]>) {
      state.exercises = action.payload;
    },
    addExercise(state, action: PayloadAction<Exercise>) {
      state.exercises.push(action.payload);
    },
    setRoutines(state, action: PayloadAction<WorkoutRoutine[]>) {
      state.routines = action.payload;
    },
    addRoutine(state, action: PayloadAction<WorkoutRoutine>) {
      state.routines.unshift(action.payload);
    },
    updateRoutine(state, action: PayloadAction<WorkoutRoutine>) {
      const index = state.routines.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.routines[index] = action.payload;
      }
    },
    deleteRoutine(state, action: PayloadAction<number>) {
      state.routines = state.routines.filter(r => r.id !== action.payload);
    },
    setProgress(state, action: PayloadAction<Progress[]>) {
      state.progress = action.payload;
    },
    addProgress(state, action: PayloadAction<Progress>) {
      state.progress.unshift(action.payload);
    },
    setDashboardSummary(state, action: PayloadAction<DashboardSummary>) {
      state.dashboardSummary = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearWorkoutState(state) {
      state.workouts = [];
      state.routines = [];
      state.progress = [];
      state.dashboardSummary = null;
      state.currentWorkout = null;
      state.error = null;
    },
  },
});

export const {
  setWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  setCurrentWorkout,
  setExercises,
  addExercise,
  setRoutines,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  setProgress,
  addProgress,
  setDashboardSummary,
  setLoading,
  setError,
  clearWorkoutState,
} = workoutSlice.actions;

export default workoutSlice.reducer;
