import React, { useRef, memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createAxiosInstance from 'src/Instances/axiosInstance';

import RNBottomSheet, {
  BottomSheetProps as RNBottomSheetProps,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  container: {
    width: '100%',
  },
});

export interface BottomSheetProps extends RNBottomSheetProps {
  isOpen: boolean;
  initialOpen?: boolean;
  children: React.ReactNode;
}

const BottomSheet = memo(function ({ isOpen, initialOpen, children, ...others }: BottomSheetProps) {
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const authData = await AsyncStorage.getItem('@auth');
        const user = JSON.parse(authData as string);
        console.log(user);
        const client = await createAxiosInstance();
        const response = await client.post(`/auth/current-user`, {
          id: user.id,
        });
        console.log(response);
        if (response) {
          setUserExists(true);
        }
      } catch {
        setUserExists(true);
        //  await AsyncStorage.removeItem('@auth');
      }
    };

    checkUserExistence();
  }, []);

  useEffect(() => {
    if (!userExists) {
      if (isOpen) bottomSheetRef.current?.snapToIndex(0);
      else bottomSheetRef.current?.close();
    }
  }, [isOpen, userExists]);

  const renderBackdropComponent = (backdropProps: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} />
  );

  if (userExists) {
    return null;
  }

  return (
    <RNBottomSheet
      ref={bottomSheetRef}
      animateOnMount
      enableDynamicSizing
      enablePanDownToClose={false}
      detached={false}
      backdropComponent={renderBackdropComponent}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      index={initialOpen ? 0 : -1}
      {...others}>
      <BottomSheetScrollView contentContainerStyle={styles.container} style={styles.root}>
        {children}
      </BottomSheetScrollView>
    </RNBottomSheet>
  );
});

export default BottomSheet;
