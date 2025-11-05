import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import createAxiosInstance from '../Instances/axiosInstance';
import { getAuthData } from '@utils/store/authStore';

type RegisterOptions = {
  persistToken?: boolean;
};

const ANDROID_CHANNELS = [
  {
    id: 'workout-reminders',
    name: 'Workout Reminders',
    description: 'Scheduled training nudges and session alerts',
  },
  {
    id: 'coaching-updates',
    name: 'Coaching Updates',
    description: 'Progress insights and goal check-ins',
  },
  {
    id: 'default',
    name: 'Default Alerts',
    description: 'Fallback channel for legacy notifications',
  },
];

async function ensureAndroidChannels() {
  await Promise.all(
    ANDROID_CHANNELS.map(channel =>
      Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      }),
    ),
  );
}

export async function registerForPushNotificationsAsync(options: RegisterOptions = {}) {
  const { persistToken = true } = options;

  if (Platform.OS === 'android') {
    await ensureAndroidChannels();
  }

  if (!Device.isDevice) {
    throw new Error('Must use physical device for push notifications');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Permission not granted to get push token for push notification!');
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error('Project ID not found');
  }

  const pushTokenString = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  if (persistToken && pushTokenString) {
    try {
      const authData = await getAuthData();
      if (authData) {
        const axiosInstance = await createAxiosInstance();
        await axiosInstance.post('/auth/add-push-token', {
          pushToken: pushTokenString,
        });
      }
    } catch (error) {
      console.warn('Failed to persist push token', error);
    }
  }

  return pushTokenString;
}
