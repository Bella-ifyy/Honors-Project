import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = '@workouts';
const PENDING_SYNC_KEY = '@pending_sync';
const EXERCISES_KEY = '@exercises_cache';
const ROUTINES_KEY = '@routines';
const PROGRESS_KEY = '@progress';

export const saveWorkoutsLocally = async (workouts: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts locally:', error);
  }
};

export const getWorkoutsLocally = async (): Promise<any[] | null> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting workouts locally:', error);
    return null;
  }
};

export const addWorkoutLocally = async (workout: any): Promise<void> => {
  try {
    const workouts = await getWorkoutsLocally() || [];
    workouts.unshift(workout);
    await saveWorkoutsLocally(workouts);
  } catch (error) {
    console.error('Error adding workout locally:', error);
  }
};

export const updateWorkoutLocally = async (workoutId: number | string, updatedWorkout: any): Promise<void> => {
  try {
    const workouts = await getWorkoutsLocally() || [];
    const index = workouts.findIndex((w: any) => w.id === workoutId);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updatedWorkout };
      await saveWorkoutsLocally(workouts);
    }
  } catch (error) {
    console.error('Error updating workout locally:', error);
  }
};

export const deleteWorkoutLocally = async (workoutId: number | string): Promise<void> => {
  try {
    const workouts = await getWorkoutsLocally() || [];
    const filtered = workouts.filter((w: any) => w.id !== workoutId);
    await saveWorkoutsLocally(filtered);
  } catch (error) {
    console.error('Error deleting workout locally:', error);
  }
};

export interface PendingAction {
  id: string;
  type: 'CREATE_WORKOUT' | 'UPDATE_WORKOUT' | 'DELETE_WORKOUT' | 'CREATE_PROGRESS';
  data: any;
  timestamp: number;
}

export const addToPendingSync = async (action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const pending = await getPendingSync();
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    pending.push(newAction);
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
    console.log('✅ Added to pending sync:', action.type);
  } catch (error) {
    console.error('Error adding to pending sync:', error);
  }
};

export const getPendingSync = async (): Promise<PendingAction[]> => {
  try {
    const data = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending sync:', error);
    return [];
  }
};

export const removePendingAction = async (actionId: string): Promise<void> => {
  try {
    const pending = await getPendingSync();
    const filtered = pending.filter(action => action.id !== actionId);
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending action:', error);
  }
};

export const clearPendingSync = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing pending sync:', error);
  }
};

export const cacheExercises = async (exercises: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify({
      data: exercises,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error caching exercises:', error);
  }
};

export const getCachedExercises = async (): Promise<any[] | null> => {
  try {
    const data = await AsyncStorage.getItem(EXERCISES_KEY);
    if (!data) return null;

    const { data: exercises, timestamp } = JSON.parse(data);
    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;

    return isExpired ? null : exercises;
  } catch (error) {
    console.error('Error getting cached exercises:', error);
    return null;
  }
};

export const saveRoutinesLocally = async (routines: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (error) {
    console.error('Error saving routines locally:', error);
  }
};

export const getRoutinesLocally = async (): Promise<any[] | null> => {
  try {
    const data = await AsyncStorage.getItem(ROUTINES_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting routines locally:', error);
    return null;
  }
};

export const saveProgressLocally = async (progressEntries: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progressEntries));
  } catch (error) {
    console.error('Error saving progress locally:', error);
  }
};

export const getProgressLocally = async (): Promise<any[] | null> => {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting progress locally:', error);
    return null;
  }
};

export const clearAllWorkoutData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      WORKOUTS_KEY,
      PENDING_SYNC_KEY,
      EXERCISES_KEY,
      ROUTINES_KEY,
      PROGRESS_KEY,
    ]);
    console.log('✅ Cleared all workout data');
  } catch (error) {
    console.error('Error clearing workout data:', error);
  }
};
