import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StackParamList } from '@navigator/stack/Stack.typeDefs';

export type NavigationProps<RouteName extends keyof StackParamList> = NativeStackScreenProps<
  StackParamList,
  RouteName
>;

export type Project = {
  id: number;
  title: string;
};
