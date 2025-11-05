import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParamList } from './Stack.typeDefs';
import SettingsScreen from '@views/Authenticated/Settings/SettingsScreen';
import UserSettings from '@views/Authenticated/UserSettings/UserSettings';
import DeleteAccount from '@views/Authenticated/DeleteAccount';
import WorkoutTracker from '@views/Authenticated/WorkoutTracker/WorkoutTracker';
import ExerciseLibrary from '@views/Authenticated/ExerciseLibrary/ExerciseLibrary';
import PlanBuilder from '@views/Authenticated/PlanBuilder/PlanBuilder';
import ProgressScreen from '@views/Authenticated/Progress/ProgressScreen';
import CreateWorkout from '@views/Authenticated/CreateWorkout/CreateWorkout';
import WorkoutDetail from '@views/Authenticated/WorkoutDetail/WorkoutDetail';
import WorkoutSession from '@views/Authenticated/WorkoutSession/WorkoutSession';

const Stack = createNativeStackNavigator<StackParamList>();

const screenOptions = {
  headerShown: false,
};

export function WorkoutStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen component={WorkoutTracker} name="WorkoutTrackerStack" />
      <Stack.Screen component={ExerciseLibrary} name="ExerciseLibraryStack" />
      <Stack.Screen component={PlanBuilder} name="PlanBuilderStack" />
      <Stack.Screen component={ProgressScreen} name="ProgressStack" />
      <Stack.Screen component={CreateWorkout} name="CreateWorkoutStack" />
      <Stack.Screen component={WorkoutDetail} name="WorkoutDetailStack" />
      <Stack.Screen component={WorkoutSession} name="WorkoutSessionStack" />
    </Stack.Navigator>
  );
}

export function ProgressStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen component={ProgressScreen} name="ProgressStack" />
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen component={SettingsScreen} name="SettingsStack" />
      <Stack.Screen component={UserSettings} name="UserSettingsStack" />
      <Stack.Screen component={DeleteAccount} name="DeleteAccountStack" />
    </Stack.Navigator>
  );
}
