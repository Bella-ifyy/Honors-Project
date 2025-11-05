import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: any;
  keyboardVerticalOffset?: number;
  behavior?: 'height' | 'position' | 'padding';
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  keyboardVerticalOffset,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
}) => {
  return (
    <View style={[styles.container, style]}>
      <KeyboardAvoidingView
        behavior={behavior}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={keyboardVerticalOffset || (Platform.OS === 'ios' ? 0 : 20)}
        enabled={true}>
        {children}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default KeyboardAvoidingWrapper;
