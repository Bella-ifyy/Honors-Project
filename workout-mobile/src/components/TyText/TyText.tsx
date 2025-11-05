import React from 'react';
import { Text, TextProps } from 'react-native';
import { fonts } from 'src/interfaces/fonts';

interface TyTextProps extends TextProps {
  weight?: 'regular' | 'bold';
}

const TyText: React.FC<TyTextProps> = ({ weight = 'regular', style, ...props }) => {
  const fontFamily = weight === 'bold' ? fonts.Inter.bold : fonts.Inter.regular;

  return <Text {...props} style={[{ fontFamily }, style]} />;
};

export default TyText;
