import createAxiosInstance from 'src/Instances/axiosInstance';
import { getAuthData } from '@utils/store/authStore';

const extractToken = (auth: any): string | undefined => {
  if (!auth) {
    return undefined;
  }

  const candidates = [
    auth.token,
    auth.accessToken,
    auth.jwt,
    auth.authToken,
    auth.sessionToken,
    auth.access_token,
    auth.bearerToken,
    auth?.tokens?.access?.token,
    auth?.tokens?.accessToken,
    auth?.tokens?.access_token,
  ];

  return candidates.find(value => typeof value === 'string' && value.length > 0);
};

const buildAuthHeaders = async () => {
  const auth = (await getAuthData()) as Record<string, any> | null;
  const token = extractToken(auth);
  const headerValue = token
    ? token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`
    : auth?.uuid;

  if (headerValue) {
    return {
      Authorization: headerValue,
      authorization: headerValue,
    };
  }

  return undefined;
};

export type RoutineTemplate = {
  id: number;
  name: string;
  description?: string;
  type?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  difficulty?: string;
  isPreDefined?: boolean;
  isFavorite?: boolean;
  exercises?: any[];
};

export const workoutApi = {
  async createWorkout(workoutData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.post('/workout/create', workoutData, {
      headers,
    });
    return response.data;
  },

  async listWorkouts() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/list', {
      headers,
    });
    return response.data;
  },

  async getWorkout(workoutId: number) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get(`/workout/${workoutId}`, {
      headers,
    });
    return response.data;
  },

  async updateWorkout(workoutId: number, workoutData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put(`/workout/${workoutId}`, workoutData, {
      headers,
    });
    return response.data;
  },

  async deleteWorkout(workoutId: number) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.delete(`/workout/${workoutId}`, {
      headers,
    });
    return response.data;
  },

  async createExercise(exerciseData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.post('/workout/exercise/create', exerciseData, {
      headers,
    });
    return response.data;
  },

  async listExercises() {
    const axiosInstance = await createAxiosInstance();
    const response = await axiosInstance.get('/workout/exercise/list');
    return response.data;
  },

  async listFavoriteExercises() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/exercise/favorites', { headers });
    return response.data;
  },

  async toggleExerciseFavorite(exerciseId: number | string) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put(`/workout/exercise/${exerciseId}/favorite`, {}, { headers });
    return response.data;
  },

  async getExercise(exerciseId: number) {
    const axiosInstance = await createAxiosInstance();
    const response = await axiosInstance.get(`/workout/exercise/${exerciseId}`);
    return response.data;
  },

  async createRoutine(routineData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.post('/workout/routine/create', routineData, {
      headers,
    });
    return response.data;
  },

  async listRoutines() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/routine/list', {
      headers,
    });
    return response.data;
  },

  async getRoutine(routineId: number) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get(`/workout/routine/${routineId}`, {
      headers,
    });
    return response.data;
  },

  async updateRoutine(routineId: number, routineData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put(`/workout/routine/${routineId}`, routineData, {
      headers,
    });
    return response.data;
  },

  async deleteRoutine(routineId: number) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.delete(`/workout/routine/${routineId}`, {
      headers,
    });
    return response.data;
  },

  async createProgress(progressData: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.post('/workout/progress/create', progressData, {
      headers,
    });
    return response.data;
  },

  async listProgress() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/progress/list', {
      headers,
    });
    return response.data;
  },

  async getProgressMetrics() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/progress/metrics', {
      headers,
    });
    return response.data;
  },

  async getDashboardSummary() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/dashboard/summary', {
      headers,
    });
    return response.data;
  },

  async getRecentWorkouts() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/dashboard/recent', {
      headers,
    });
    return response.data;
  },

  async getWorkoutTemplates() {
    const axiosInstance = await createAxiosInstance();
    const response = await axiosInstance.get('/public/workout/templates');
    return response.data;
  },

  async listFavoriteRoutines() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/routine/favorites/list', {
      headers,
    });
    return response.data;
  },

  async toggleRoutineFavorite(routineId: number | string) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put(`/workout/routine/${routineId}/favorite`, {}, {
      headers,
    });
    return response.data;
  },

  async getReminder() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/reminder', { headers });
    return response.data;
  },

  async setReminder(payload: { enabled?: boolean; timeOfDay?: string; days?: string[] }) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put('/workout/reminder', payload, { headers });
    return response.data;
  },

  async getWorkoutProfile() {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.get('/workout/profile', { headers });
    return response.data;
  },

  async saveWorkoutProfile(payload: any) {
    const axiosInstance = await createAxiosInstance();
    const headers = await buildAuthHeaders();
    const response = await axiosInstance.put('/workout/profile', payload, { headers });
    return response.data;
  },
};
