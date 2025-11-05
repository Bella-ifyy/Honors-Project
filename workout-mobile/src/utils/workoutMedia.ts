import type { AVPlaybackSource } from 'expo-av';
import { resolveWorkoutVideoFileName } from './workoutVideoManifest';

// Public Cloudflare R2 bucket for workout videos
// If you move buckets, update this base; fallback order handles local assets.
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
  // 1) Explicit backend-provided media URL takes priority
  if (mediaUrl) {
    return { source: { uri: mediaUrl } };
  }

  // 2) Remote CDN (Cloudflare R2) if available by name
  const remoteSource = buildRemoteSource(name);
  if (remoteSource) {
    return remoteSource;
  }

  return null;
};
