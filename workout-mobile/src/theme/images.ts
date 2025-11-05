import type { ImageSourcePropType } from 'react-native';

type ThemeImages = {
  logo: ImageSourcePropType;
  logoLg: ImageSourcePropType;
};

export const images: ThemeImages = {
  logo: require('@assets/images/logo.png'),
  logoLg: require('@assets/images/logo-lg.png'),
};
