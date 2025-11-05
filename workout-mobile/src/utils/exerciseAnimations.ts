/**
 * Exercise Animation Utility
 * 
 * This utility provides fallback animation URLs for common exercises.
 * When the backend doesn't provide a mediaUrl, this can be used as a fallback.
 * 
 * To add animations:
 * 1. Upload your animation videos to a CDN or storage service
 * 2. Add the exercise name and URL mapping below
 * 3. The system will automatically use these as fallbacks
 */

export type ExerciseAnimationMap = Record<string, string>;

/**
 * Fallback animation URLs for common exercises
 * Format: exercise name (normalized) -> animation URL
 * 
 * You can use:
 * - Your own CDN/storage URLs
 * - Public exercise animation services
 * - Placeholder services like placeholder.com
 */
const EXERCISE_ANIMATION_MAP: ExerciseAnimationMap = {
  // Cardio exercises
  'jump rope': 'https://example.com/animations/jump-rope.mp4',
  'high knees': 'https://example.com/animations/high-knees.mp4',
  'mountain climbers': 'https://example.com/animations/mountain-climbers.mp4',
  
  // Strength exercises
  'squats': 'https://example.com/animations/squats.mp4',
  'push ups': 'https://example.com/animations/push-ups.mp4',
  'push-ups': 'https://example.com/animations/push-ups.mp4',
  'bent over rows': 'https://example.com/animations/bent-over-rows.mp4',
  
  // Mobility exercises
  'worlds greatest stretch': 'https://example.com/animations/worlds-greatest-stretch.mp4',
  'hip openers': 'https://example.com/animations/hip-openers.mp4',
  'thoracic rotations': 'https://example.com/animations/thoracic-rotations.mp4',
  
  // Sports exercises
  'agility ladder': 'https://example.com/animations/agility-ladder.mp4',
  'sprint drills': 'https://example.com/animations/sprint-drills.mp4',
  'plyometric jumps': 'https://example.com/animations/plyometric-jumps.mp4',
};

/**
 * Normalizes an exercise name for lookup
 * - Converts to lowercase
 * - Removes extra spaces
 * - Handles common variations
 */
const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
};

/**
 * Gets a fallback animation URL for an exercise
 * @param exerciseName - The name of the exercise
 * @returns The animation URL if found, null otherwise
 */
export const getExerciseAnimationUrl = (exerciseName: string | null | undefined): string | null => {
  if (!exerciseName) {
    return null;
  }

  const normalized = normalizeExerciseName(exerciseName);
  
  // Direct match
  if (EXERCISE_ANIMATION_MAP[normalized]) {
    return EXERCISE_ANIMATION_MAP[normalized];
  }

  // Partial match (for variations like "Jump Rope" vs "jump rope")
  const partialMatch = Object.keys(EXERCISE_ANIMATION_MAP).find(key => 
    normalized.includes(key) || key.includes(normalized)
  );

  return partialMatch ? EXERCISE_ANIMATION_MAP[partialMatch] : null;
};

/**
 * Adds or updates an exercise animation URL
 * @param exerciseName - The name of the exercise
 * @param url - The animation URL
 */
export const setExerciseAnimationUrl = (exerciseName: string, url: string): void => {
  const normalized = normalizeExerciseName(exerciseName);
  EXERCISE_ANIMATION_MAP[normalized] = url;
};

/**
 * Gets all exercise animation mappings
 */
export const getAllExerciseAnimations = (): ExerciseAnimationMap => {
  return { ...EXERCISE_ANIMATION_MAP };
};

