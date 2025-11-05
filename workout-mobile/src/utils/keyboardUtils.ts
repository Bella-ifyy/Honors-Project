import { Platform } from 'react-native';

export const KEYBOARD_CONFIG = {
  // KeyboardAvoidingView behavior
  behavior: Platform.OS === 'ios' ? 'padding' : 'height' as const,
  
  // Keyboard vertical offset
  keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
  
  // ScrollView keyboard handling
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: 'interactive' as const,
  
  // TextInput configurations
  textInputConfig: {
    autoCorrect: false,
    blurOnSubmit: false,
    returnKeyType: 'next' as const,
  },
  
  // Platform-specific configurations
  platform: {
    ios: {
      behavior: 'padding' as const,
      keyboardVerticalOffset: 0,
    },
    android: {
      behavior: 'height' as const,
      keyboardVerticalOffset: 20,
    },
  },
};

export const getKeyboardConfig = (screenType: 'form' | 'list' | 'chat' = 'form') => {
  const baseConfig = {
    behavior: KEYBOARD_CONFIG.behavior,
    keyboardVerticalOffset: KEYBOARD_CONFIG.keyboardVerticalOffset,
    keyboardShouldPersistTaps: KEYBOARD_CONFIG.keyboardShouldPersistTaps,
    keyboardDismissMode: KEYBOARD_CONFIG.keyboardDismissMode,
  };

  switch (screenType) {
    case 'form':
      return {
        ...baseConfig,
        keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
      };
    case 'list':
      return {
        ...baseConfig,
        keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 10,
      };
    case 'chat':
      return {
        ...baseConfig,
        keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 0,
      };
    default:
      return baseConfig;
  }
};

export const getTextInputConfig = (inputType: 'email' | 'password' | 'text' | 'multiline' = 'text') => {
  const baseConfig = {
    autoCorrect: false,
    blurOnSubmit: inputType !== 'multiline',
    returnKeyType: inputType === 'multiline' ? 'default' : 'next',
  };

  switch (inputType) {
    case 'email':
      return {
        ...baseConfig,
        keyboardType: 'email-address' as const,
        autoCapitalize: 'none' as const,
        autoComplete: 'email' as const,
      };
    case 'password':
      return {
        ...baseConfig,
        secureTextEntry: true,
        autoCapitalize: 'none' as const,
        autoComplete: 'password' as const,
        returnKeyType: 'done' as const,
        blurOnSubmit: true,
      };
    case 'multiline':
      return {
        ...baseConfig,
        multiline: true,
        textAlignVertical: 'top' as const,
        returnKeyType: 'default' as const,
        blurOnSubmit: true,
      };
    default:
      return {
        ...baseConfig,
        autoCapitalize: 'sentences' as const,
        autoComplete: 'off' as const,
      };
  }
};
