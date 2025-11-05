declare module 'expo-blur' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';

  export interface BlurViewProps extends ViewProps {
    tint?: 'light' | 'dark' | 'default';
    intensity?: number;
    experimentalBlurMethod?: 'none' | 'dimezisBlurView';
  }

  export class BlurView extends React.Component<BlurViewProps> {}
}
