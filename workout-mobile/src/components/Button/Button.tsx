import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  GestureResponderEvent,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import Image from '../Image';
import { colors } from '@theme';
import React from 'react';
import TyText from '@components/TyText/TyText';

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export interface ButtonProps
  extends Omit<
    PressableProps,
    | 'title'
    | 'image'
    | 'imageStyle'
    | 'titleStyle'
    | 'onPress'
    | 'onLongPress'
    | 'isLoading'
    | 'loaderColor'
    | 'style'
  > {
  title?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  isLoading?: boolean;
  loaderColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Button({
  title,
  titleStyle,
  image,
  style,
  disabled,
  isLoading,
  loaderColor = colors.white,
  imageStyle,
  children,
  ...others
}: ButtonProps) {
  const opacityStyle = { opacity: disabled ? 0.6 : 1 };
  return (
    <Pressable
      style={[styles.root, opacityStyle, style]}
      disabled={disabled ?? isLoading}
      {...others}>
      {children}
      {isLoading && <ActivityIndicator size="small" color={loaderColor} />}
      {!isLoading && image && <Image source={image} style={imageStyle} />}
      {!isLoading && title && <TyText style={titleStyle}>{title}</TyText>}
    </Pressable>
  );
}

export default Button;
