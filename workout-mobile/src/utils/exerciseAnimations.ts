export type ExerciseAnimationMap = Record<string, string>;

const EXERCISE_ANIMATION_MAP: ExerciseAnimationMap = {
  'jump rope': 'https://example.com/animations/jump-rope.mp4',
  'high knees': 'https://example.com/animations/high-knees.mp4',
  'mountain climbers': 'https://example.com/animations/mountain-climbers.mp4',

  'squats': 'https://example.com/animations/squats.mp4',
  'push ups': 'https://example.com/animations/push-ups.mp4',
  'push-ups': 'https://example.com/animations/push-ups.mp4',
  'bent over rows': 'https://example.com/animations/bent-over-rows.mp4',

  'worlds greatest stretch': 'https://example.com/animations/worlds-greatest-stretch.mp4',
  'hip openers': 'https://example.com/animations/hip-openers.mp4',
  'thoracic rotations': 'https://example.com/animations/thoracic-rotations.mp4',

  'agility ladder': 'https://example.com/animations/agility-ladder.mp4',
  'sprint drills': 'https://example.com/animations/sprint-drills.mp4',
  'plyometric jumps': 'https://example.com/animations/plyometric-jumps.mp4',
};

const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
};

export const getExerciseAnimationUrl = (exerciseName: string | null | undefined): string | null => {
  if (!exerciseName) {
    return null;
  }

  const normalized = normalizeExerciseName(exerciseName);

  if (EXERCISE_ANIMATION_MAP[normalized]) {
    return EXERCISE_ANIMATION_MAP[normalized];
  }

  const partialMatch = Object.keys(EXERCISE_ANIMATION_MAP).find(key =>
    normalized.includes(key) || key.includes(normalized)
  );

  return partialMatch ? EXERCISE_ANIMATION_MAP[partialMatch] : null;
};

export const setExerciseAnimationUrl = (exerciseName: string, url: string): void => {
  const normalized = normalizeExerciseName(exerciseName);
  EXERCISE_ANIMATION_MAP[normalized] = url;
};

export const getAllExerciseAnimations = (): ExerciseAnimationMap => {
  return { ...EXERCISE_ANIMATION_MAP };
};
