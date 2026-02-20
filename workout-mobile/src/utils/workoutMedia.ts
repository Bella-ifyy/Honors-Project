import type { AVPlaybackSource } from 'expo-av';
import { resolveWorkoutVideoFileName } from './workoutVideoManifest';

const WORKOUT_VIDEO_BASE_URL = 'https://pub-43c3e66aa9cf4ad1b26282ac361ac465.r2.dev';

export type ResolvedVideo = {
  source: AVPlaybackSource;
  isGeneric?: boolean;
};

const buildRemoteSource = (name?: string | null, isGeneric = false): ResolvedVideo | null => {
  if (!WORKOUT_VIDEO_BASE_URL) {
    return null;
  }
  const fileName = resolveWorkoutVideoFileName(name);
  if (!fileName) {
    return null;
  }
  return { source: { uri: `${WORKOUT_VIDEO_BASE_URL}/${fileName}` }, isGeneric };
};

export const resolveExerciseVideo = (
  name?: string | null,
  mediaUrl?: string | null,
): ResolvedVideo | null => {
  if (mediaUrl) {
    return { source: { uri: mediaUrl } };
  }

  const remoteSource = buildRemoteSource(name);
  if (remoteSource) {
    return remoteSource;
  }

  return null;
};
