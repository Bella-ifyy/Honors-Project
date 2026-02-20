import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthData = {
  token?: string;
  userId?: string;
  email?: string;
  [key: string]: any;
};

const AUTH_KEY = '@authData';

export const setAuthData = async (authData: any): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(AUTH_KEY);
    let combinedData: AuthData = authData;

    if (existingData) {
      const parsedExistingData: AuthData = JSON.parse(existingData);
      combinedData = { ...parsedExistingData, ...authData };
    }

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(combinedData));
  } catch (error) {
    console.error('Error setting auth data:', error);
  }
};

export function getAuthData(): Promise<AuthData | null>;
export function getAuthData<T = unknown>(key: string): Promise<T | null>;
export async function getAuthData<T = unknown>(key?: string): Promise<AuthData | T | null> {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    if (!data) {
      return null;
    }

    const parsed: AuthData = JSON.parse(data);
    if (key) {
      return (parsed?.[key] as T) ?? null;
    }

    return parsed;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
}

export const updateAuthDataField = async (key: string, value: any): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(AUTH_KEY);
    let updatedData: AuthData = { [key]: value };

    if (existingData) {
      const parsedExistingData: AuthData = JSON.parse(existingData);
      updatedData = { ...parsedExistingData, [key]: value };
    }

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error updating auth data field:', error);
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
