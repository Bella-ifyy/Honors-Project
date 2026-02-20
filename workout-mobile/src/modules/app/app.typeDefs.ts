export interface IUser {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  uuid?: string;
  workoutOnboardingCompleted?: boolean;
}

export interface IAppState {
  checked: boolean;
  loggedIn: boolean;
  user?: IUser;
}
