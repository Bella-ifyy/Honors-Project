import { getAuthData } from '@utils/store/authStore';
export function useAppService() {
  async function getUser(): Promise<any> {
    try {
      const authData = await getAuthData();
      if (authData) {
        return authData;
      } else {
        throw new Error('No user data found');
      }
    } catch (err: any) {
      return Promise.reject(new Error(`Failed to get user data: ${err.message}`));
    }
  }

  return { getUser };
}
