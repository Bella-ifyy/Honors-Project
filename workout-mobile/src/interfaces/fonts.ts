import { loadAsync } from 'expo-font';

export const fonts = {
  Inter: {
    regular: 'Inter_regular',
    bold: 'Inter_bold',
  },
};

export const loadFonts = () =>
  loadAsync({
    Inter_regular: require('@assets/fonts/inter/Inter-Regular.otf'),
    Inter_bold: require('@assets/fonts/inter/Inter-Bold.otf'),
  });
