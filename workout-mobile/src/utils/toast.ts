import Toast from 'react-native-root-toast';

type ToastPreset = 'done' | 'error' | 'custom';
type ToastHaptic = 'success' | 'warning' | 'error' | 'none';

const showToast = (
  title: string,
  options: {
    message?: string;
    preset?: ToastPreset;
    haptic?: ToastHaptic;
    icon?: { ios: string; android?: string };
    duration?: number;
  } = {},
) => {
  const preset = options.preset ?? 'custom';
  const backgroundColor =
    preset === 'done'
      ? '#16A34A'
      : preset === 'error'
        ? '#DC2626'
        : '#1F2937';

  Toast.show(options.message ? `${title}\n${options.message}` : title, {
    duration: options.duration ?? Toast.durations.SHORT,
    position: Toast.positions.TOP,
    shadow: false,
    backgroundColor,
    textColor: '#FFFFFF',
    opacity: 0.98,
  });
};

export const toastSuccess = (title: string, message?: string) =>
  showToast(title, { message, preset: 'done', haptic: 'success' });

export const toastError = (title: string, message?: string) =>
  showToast(title, { message, preset: 'error', haptic: 'error' });

export const toastInfo = (title: string, message?: string) =>
  showToast(title, { message, preset: 'custom', haptic: 'none' });

export const toastWarning = (title: string, message?: string) =>
  showToast(title, { message, preset: 'custom', haptic: 'warning' });

export const dismissAllToasts = () => {
};
