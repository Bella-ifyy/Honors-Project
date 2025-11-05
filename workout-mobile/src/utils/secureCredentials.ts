import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'workout_credentials';

type Credentials = {
  email: string;
  password: string;
};

export async function saveCredentials(credentials: Credentials): Promise<void> {
  try {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.warn('Failed to save credentials securely', error);
  }
}

export async function getSavedCredentials(): Promise<Credentials | null> {
  try {
    const value = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!value) {
      return null;
    }
    const parsed = JSON.parse(value);
    if (parsed?.email && parsed?.password) {
      return parsed as Credentials;
    }
    return null;
  } catch (error) {
    console.warn('Failed to read saved credentials', error);
    return null;
  }
}

export async function clearSavedCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch (error) {
    console.warn('Failed to clear saved credentials', error);
  }
}

