import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Keyboard, StatusBar, View, StyleSheet } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import Navigator from '@navigator';
import store from '@utils/store';
import { NotificationProvider } from './src/context/NotificationContext';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { RootSiblingParent } from 'react-native-root-siblings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function App() {
  // Configure keyboard behavior globally
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Prevent keyboard glitches by ensuring proper focus management
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Clean up any keyboard-related state
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AlertNotificationRoot>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <RootSiblingParent>
              <Provider store={store}>
                <NotificationProvider>
                  <View style={styles.appShell}>
                    <Navigator />
                  </View>
                </NotificationProvider>
              </Provider>
            </RootSiblingParent>
          </SafeAreaView>
        </GestureHandlerRootView>
      </AlertNotificationRoot>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
