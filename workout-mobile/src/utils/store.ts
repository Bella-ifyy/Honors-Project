import { configureStore } from '@reduxjs/toolkit';
import app from '@modules/app/app.slice';
import workout from '@modules/workout/workout.slice';
import config from '@utils/config';
import axios from 'axios';
import Config from '../../constant';

const store = configureStore({
  reducer: {
    app,
    workout,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
  devTools: config.ENV === 'dev',
});

export const axiosInstance = axios.create({
  baseURL: Config.EXPO_PUBLIC_API_BASE_URL,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export default store;
