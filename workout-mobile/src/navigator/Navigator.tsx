import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator as TabNavigator } from './tab/Tab';
import { Toast } from 'react-native-alert-notification';
import { useAppService, useAppSlice } from '@modules/app';

function Navigator() {
  const { getUser } = useAppService();
  const { dispatch, setUser, setLoggedIn } = useAppSlice();

  const preload = async () => {
    try {
      const user = await getUser();
      dispatch(setUser(user));
      dispatch(setLoggedIn(!!user));
    } catch {
    }

  };

  useEffect(() => {
    preload();
  }, []);

  return (
    <NavigationContainer>
      <TabNavigator />
      <Toast isDark={false} />
    </NavigationContainer>
  );
}

export default Navigator;
