// constants.ts
// Simple environment configuration:
// - Simulator: uses localhost:3014 (local backend)
// - Physical Device: uses Vercel staging server
// - Production Build: uses Vercel production server
//
import * as Device from 'expo-device';

// Define the structure for environment variables
interface Environment {
  EXPO_PUBLIC_ENV: string;
  EXPO_PUBLIC_API_URL: string;
  EXPO_PUBLIC_API_BASE_URL: string;
  EXPO_PUBLIC_SLUG: string;
  EXPO_PUBLIC_NAME: string;
  EXPO_PUBLIC_PROJECT_ID: string;
  EXPO_PUBLIC_VIVA_CLIENT_SECRET: string;
  EXPO_PUBLIC_VIVA_MERCHANT_ID: string;
  EXPO_PUBLIC_VIVA_API_KEY: string;
  EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: string;
  EXPO_PUBLIC_IOS_ANDROID_PACKAGE: string;
}

// Allow runtime override via Expo public env vars
const runtimeOverride: Partial<Environment> = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL,
};

// Define the environment-specific configurations
const environments: { [key: string]: Environment } = {
  development: {
    EXPO_PUBLIC_ENV: 'development',
    EXPO_PUBLIC_API_URL: 'http://localhost:3014/workout/api/v1',
    EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3014/workout/api/v1',
    EXPO_PUBLIC_SLUG: 'workout',
    EXPO_PUBLIC_NAME: 'workout',
    EXPO_PUBLIC_PROJECT_ID: 'b4a8b7a6-a306-4bc8-9914-6b4b84aa218c',
    EXPO_PUBLIC_VIVA_CLIENT_SECRET: 'aC5O0pA0EzPps168inf8htVUBzU2xB',
    EXPO_PUBLIC_VIVA_MERCHANT_ID: 'a77eafc7-5d9d-499d-ba1f-84af42b24374',
    EXPO_PUBLIC_VIVA_API_KEY: '4gH^Ku',
    EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: 'com.ajibadedapo.workout',
    EXPO_PUBLIC_IOS_ANDROID_PACKAGE: 'com.ajibadedapo.workout.dev',
  },
  staging: {
    EXPO_PUBLIC_ENV: 'staging',
    EXPO_PUBLIC_API_URL: 'https://workout-backend.vercel.app/workout/api/v1',
    EXPO_PUBLIC_API_BASE_URL: 'https://workout-backend.vercel.app/workout/api/v1',
    EXPO_PUBLIC_SLUG: 'workout',
    EXPO_PUBLIC_NAME: 'workout',
    EXPO_PUBLIC_PROJECT_ID: 'b4a8b7a6-a306-4bc8-9914-6b4b84aa218c',
    EXPO_PUBLIC_VIVA_CLIENT_SECRET: 'aC5O0pA0EzPps168inf8htVUBzU2xB',
    EXPO_PUBLIC_VIVA_MERCHANT_ID: 'a77eafc7-5d9d-499d-ba1f-84af42b24374',
    EXPO_PUBLIC_VIVA_API_KEY: '4gH^Ku',
    EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: 'com.ajibadedapo.workout',
    EXPO_PUBLIC_IOS_ANDROID_PACKAGE: 'com.ajibadedapo.workout.stg',
  },
  production: {
    EXPO_PUBLIC_ENV: 'production',
    EXPO_PUBLIC_API_URL: 'https://workout-backend.vercel.app/workout/api/v1',
    EXPO_PUBLIC_API_BASE_URL: 'https://workout-backend.vercel.app/workout/api/v1',
    EXPO_PUBLIC_SLUG: 'workout',
    EXPO_PUBLIC_NAME: 'workout',
    EXPO_PUBLIC_PROJECT_ID: 'b4a8b7a6-a306-4bc8-9914-6b4b84aa218c',
    EXPO_PUBLIC_VIVA_CLIENT_SECRET: 'aC5O0pA0EzPps168inf8htVUBzU2xB',
    EXPO_PUBLIC_VIVA_MERCHANT_ID: 'a77eafc7-5d9d-499d-ba1f-84af42b24374',
    EXPO_PUBLIC_VIVA_API_KEY: '4gH^Ku',
    EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: 'com.ajibadedapo.workout',
    EXPO_PUBLIC_IOS_ANDROID_PACKAGE: 'com.ajibadedapo.workout.prod',
  },
};

// Determine the current environment
const getEnvironment = () => {
  // Production build always uses production
  if (!__DEV__) {
    return 'production';
  }
  
  // Development mode:
  // - Simulator: use localhost (development)
  // - Physical Device: use Vercel backend (staging)
  return Device.isDevice ? 'staging' : 'development';
};

const currentEnv = getEnvironment();

// Get the configuration for the current environment
const baseConfig: Environment = environments[currentEnv];
const merged: Environment = {
  ...baseConfig,
  ...runtimeOverride,
  EXPO_PUBLIC_ENV: baseConfig.EXPO_PUBLIC_ENV,
};

export default merged;
