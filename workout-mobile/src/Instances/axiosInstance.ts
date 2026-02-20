import axios, { InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { getAuthData } from '@utils/store/authStore';
import Config from '../../constant';

type AuthRecord = Record<string, unknown> & {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  authToken?: string;
  sessionToken?: string;
  bearerToken?: string;
  uuid?: string;
  tokens?: {
    access?: { token?: string };
    accessToken?: string;
    access_token?: string;
  };
};

const extractToken = (auth: AuthRecord | null): string | undefined => {
  if (!auth) return undefined;

  const candidates: (string | undefined)[] = [
    auth.token as string | undefined,
    auth.accessToken as string | undefined,
    auth.jwt as string | undefined,
    auth.authToken as string | undefined,
    auth.sessionToken as string | undefined,
    auth.access_token as string | undefined,
    auth.bearerToken as string | undefined,
    auth.tokens?.access?.token as string | undefined,
    auth.tokens?.accessToken as string | undefined,
    auth.tokens?.access_token as string | undefined,
  ];

  return candidates.find(value => typeof value === 'string' && value.length > 0);
};

const applyAuthHeaders = <T extends InternalAxiosRequestConfig>(config: T, headerValue?: string) => {
  if (!headerValue) return config;

  const headers = config.headers ?? {};
  const mutableHeaders = headers as Record<string, string | undefined>;
  mutableHeaders.Authorization = headerValue;
  mutableHeaders.authorization = headerValue;
  mutableHeaders['x-access-token'] = headerValue;
  config.headers = mutableHeaders as typeof config.headers;
  return config;
};

const resolveBaseUrl = (): string => {
  const runtime =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL;

  const configUrl =
    Config.EXPO_PUBLIC_API_BASE_URL ||
    Config.EXPO_PUBLIC_API_URL;

  const raw = runtime || configUrl || 'http://127.0.0.1:3014/workout/api/v1';

  if (Platform.OS === 'android') {
    return raw.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return raw;
};

const baseURL = resolveBaseUrl();

const createAxiosInstance = async () => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
  });

  if (__DEV__) {
    console.log('Axios base URL:', baseURL);
  }

  axiosInstance.interceptors.request.use(async config => {
    const authData = (await getAuthData()) as AuthRecord | null;
    const token = extractToken(authData);

    if (token) {
      const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      return applyAuthHeaders(config, bearer);
    }

    if (authData?.uuid && typeof authData.uuid === 'string') {
      return applyAuthHeaders(config, authData.uuid);
    }

    return config;
  });

  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export default createAxiosInstance;
