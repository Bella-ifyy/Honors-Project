import Constants from 'expo-constants';

export type Config = {
  ENV: string;
  API_URL: string;
};

export default {
  ENV: Constants.expoConfig?.extra?.ENV,
  API_URL: Constants.expoConfig?.extra?.API_URL,
} as Config;
