import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabParamList } from './Tab.typeDefs';
import { StackParamList } from '@navigator/stack';
import { WorkoutStackNavigator, ProgressStackNavigator, ProfileStackNavigator } from '../stack/Stack';
import Welcome from '@views/Onboarding/Welcome';
import CreateAccount from '@views/Onboarding/CreateAccount';
import Login from '@views/Login/Login';
import { useAppSlice } from '@modules/app';
import { colors } from '@theme';

const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createNativeStackNavigator<StackParamList>();

const tabIconMap: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  WorkoutsTab: 'barbell-outline',
  ProgressTab: 'stats-chart-outline',
  ProfileTab: 'person-circle-outline',
};

export function Navigator() {
  const { loggedIn } = useAppSlice();

  return loggedIn ? (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIconMap[route.name]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen name="WorkoutsTab" component={WorkoutStackNavigator} options={{ title: 'Workouts' }} />
      <Tab.Screen name="ProgressTab" component={ProgressStackNavigator} options={{ title: 'Progress' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  ) : (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={Welcome} name="WelcomeStack" />
      <AuthStack.Screen component={CreateAccount} name="CreateAccountStack" />
      <AuthStack.Screen component={Login} name="LoginStack" />
    </AuthStack.Navigator>
  );
}

export default Navigator;
