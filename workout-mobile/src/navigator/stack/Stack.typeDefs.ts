import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParamList = {
  WelcomeStack: { from?: string; [key: string]: any };
  CreateAccountStack: { from?: string; [key: string]: any };
  LoginStack: { from?: string; [key: string]: any };
  SettingsStack: { from?: string; [key: string]: any };
  UserSettingsStack: { from?: string; [key: string]: any };
  DeleteAccountStack: { from?: string; [key: string]: any };
  WorkoutTrackerStack: { from?: string; preset?: string };
  ExerciseLibraryStack: { from?: string };
  PlanBuilderStack: { from?: string };
  ProgressStack: { from?: string };
  CreateWorkoutStack: {
    from?: string;
    preset?: string;
    isEdit?: boolean;
    workoutId?: number;
    workoutData?: any;
    template?: any;
    templateId?: number;
    mode?: 'edit' | 'clone';
  };
  WorkoutDetailStack: { workoutId: number };
  WorkoutSessionStack: {
    workoutId?: number;
    preset?: string;
    workoutData?: any;
  };
};

export type StackProps<RouteName extends keyof StackParamList = keyof StackParamList> =
  NativeStackScreenProps<StackParamList, RouteName>;
