import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackProps } from '@navigator';
import fitnessTheme, { getWorkoutColor } from '@theme/fitness.theme';
import { workoutApi } from '@modules/workout/workout.api';
import {
  addWorkout,
  updateWorkout as updateWorkoutAction,
  setExercises as setExercisesAction,
  setDashboardSummary,
  type Workout,
} from '@modules/workout/workout.slice';
import { useDispatch, useSelector } from 'react-redux';
import type { State } from '@utils/store';
import {
  addWorkoutLocally,
  updateWorkoutLocally,
  addToPendingSync,
} from '@utils/store/workoutStore';
import { checkIsOnline } from '@utils/networkUtils';
import { deriveDashboardSummary } from '@modules/workout/workout.utils';
import { resolveExerciseVideo } from '@utils/workoutMedia';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

type SessionExercise = {
  exerciseId: number;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
  exercise?: { mediaUrl?: string } | null;
  mediaUrl?: string | null;
};

type SessionData = {
  id?: number;
  name: string;
  notes?: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  estimatedCalories: number;
  exercises: SessionExercise[];
  source: 'existing' | 'preset' | 'custom';
};

const DEFAULT_CARDIO_EXERCISES: SessionExercise[] = [
  { exerciseId: 1, name: 'Jump Rope', sets: 1, reps: 0, duration: 5 },
  { exerciseId: 2, name: 'High Knees', sets: 1, reps: 0, duration: 5 },
  { exerciseId: 3, name: 'Mountain Climbers', sets: 1, reps: 0, duration: 5 },
];

const DEFAULT_STRENGTH_EXERCISES: SessionExercise[] = [
  { exerciseId: 4, name: 'Squats', sets: 3, reps: 12, duration: 0 },
  { exerciseId: 5, name: 'Push Ups', sets: 3, reps: 10, duration: 0 },
  { exerciseId: 6, name: 'Bent Over Rows', sets: 3, reps: 12, duration: 0 },
];

const DEFAULT_MOBILITY_EXERCISES: SessionExercise[] = [
  { exerciseId: 7, name: "Worlds Greatest Stretch", sets: 1, reps: 0, duration: 4 },
  { exerciseId: 8, name: 'Hip Openers', sets: 1, reps: 0, duration: 4 },
  { exerciseId: 9, name: 'Thoracic Rotations', sets: 1, reps: 0, duration: 4 },
];

const DEFAULT_SPORTS_EXERCISES: SessionExercise[] = [
  { exerciseId: 10, name: 'Agility Ladder', sets: 1, reps: 0, duration: 5 },
  { exerciseId: 11, name: 'Sprint Drills', sets: 1, reps: 0, duration: 5 },
  { exerciseId: 12, name: 'Plyometric Jumps', sets: 1, reps: 0, duration: 5 },
];

const asFontWeight = (value: string): TextStyle['fontWeight'] =>
  value as TextStyle['fontWeight'];

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const estimateCalories = (type: string, minutes: number) => {
  const perMinute = {
    cardio: 9,
    strength: 6,
    flexibility: 4,
    sports: 8,
  } as const;
  const rate = perMinute[type as keyof typeof perMinute] ?? 6;
  return Math.max(60, Math.round(minutes * rate));
};

const ACCENT_COLOR = '#1F7BFF';
const accentOverlay = 'rgba(31, 123, 255, 0.12)';
const accentOverlayStrong = 'rgba(31, 123, 255, 0.22)';
const successOverlay = 'rgba(34, 197, 94, 0.16)';

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WorkoutSession = ({ navigation, route }: StackProps<'WorkoutSessionStack'>) => {
  const dispatch = useDispatch();
  const exercisesFromStore = useSelector((state: State) => state.workout.exercises);
  const workoutsFromStore = useSelector((state: State) => state.workout.workouts);
  const [exerciseLibrary, setExerciseLibrary] = useState(exercisesFromStore);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseElapsedTime, setExerciseElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);

  const workoutIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exerciseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<Video>(null);

  const stopTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
  };

  const mergeWorkoutIntoList = (list: any[], workout: any) => {
    if (!workout) {
      return list;
    }
    if (workout.id === undefined || workout.id === null) {
      return [workout, ...list];
    }
    const filtered = list.filter(existing => existing?.id !== workout.id);
    return [workout, ...filtered];
  };

  const refreshDashboardSummary = (list: any[]) => {
    const summary = deriveDashboardSummary(list as any);
    dispatch(setDashboardSummary(summary));
  };

  useEffect(() => {
    return () => stopTimers();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let library = exerciseLibrary;
        if (!library || library.length === 0) {
          const fetched = await workoutApi.listExercises();
          library = fetched;
          setExerciseLibrary(fetched);
          dispatch(setExercisesAction(fetched));
        }

        const params = route?.params ?? {};
        if (params?.workoutId) {
          workoutIdRef.current = params.workoutId;
          const workout = await workoutApi.getWorkout(params.workoutId);
          setSession(buildSessionFromWorkout(workout));
        } else if (params?.workoutData) {
          const workout = params.workoutData;
          workoutIdRef.current = workout?.id ?? null;
          setSession(buildSessionFromWorkout(workout));
        } else if (params?.preset) {
          const presetSession = buildSessionFromPreset(params.preset as string, library);
          setSession(presetSession);
        } else {
          const defaultSession = buildSessionFromPreset('strength', library);
          setSession(defaultSession);
        }
      } catch (error) {
        console.error('Error preparing workout session:', error);
        toastError('Error', 'Unable to load workout session.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params]);

  const currentExercise = useMemo(() => {
    if (!session || currentExerciseIndex >= session.exercises.length) {
      return null;
    }
    return session.exercises[currentExerciseIndex];
  }, [session, currentExerciseIndex]);

  const toggleTimer = () => {
    if (isRunning) {
      stopTimers();
      setIsRunning(false);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    exerciseTimerRef.current = setInterval(() => {
      setExerciseElapsedTime(prev => prev + 1);
    }, 1000);
    setIsRunning(true);
  };

  const markExerciseComplete = (index: number) => {
    setCompletedExercises(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  const goToNextExercise = () => {
    if (!session) {
      return;
    }
    markExerciseComplete(currentExerciseIndex);
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setExerciseElapsedTime(0);
    } else {
      toastInfo('Great job!', 'You have completed all exercises. Finish the workout to save it.');
    }
  };

  const handleFinishWorkout = async () => {
    if (!session) {
      return;
    }
    stopTimers();
    setIsRunning(false);
    setSaving(true);

    const durationMinutes = Math.max(1, Math.round(elapsedTime / 60));
    const payload = {
      name: session.name,
      date: new Date().toISOString(),
      notes: session.notes ?? '',
      totalDuration: durationMinutes,
      caloriesBurned: session.estimatedCalories || estimateCalories(session.type, durationMinutes),
      isCompleted: true,
      exercises: session.exercises.map((exercise, index) => ({
        id: typeof exercise.exerciseId === 'number' ? exercise.exerciseId : -(index + 1),
        exerciseId: exercise.exerciseId,
        sets: exercise.sets ?? 0,
        reps: exercise.reps ?? 0,
        weight: exercise.weight ?? 0,
        duration: exercise.duration ?? 0,
        notes: exercise.notes ?? '',
        orderIndex: index,
      })),
    };

    try {
      const isOnline = await checkIsOnline();

      if (session.source === 'existing' && workoutIdRef.current) {
        if (!isOnline) {
          toastInfo('Offline', 'Reconnect to update this workout. Progress stays locally.');
          return;
        }
        const updatedWorkout = await workoutApi.updateWorkout(workoutIdRef.current, payload);
        dispatch(updateWorkoutAction(updatedWorkout));
        await updateWorkoutLocally(workoutIdRef.current, updatedWorkout);
        const merged = mergeWorkoutIntoList(workoutsFromStore, updatedWorkout);
        refreshDashboardSummary(merged);
        toastSuccess('Workout complete!', 'Your workout has been updated.');
      } else if (isOnline) {
        const savedWorkout = await workoutApi.createWorkout(payload);
        dispatch(addWorkout(savedWorkout));
        await addWorkoutLocally(savedWorkout);
        const merged = mergeWorkoutIntoList(workoutsFromStore, savedWorkout);
        refreshDashboardSummary(merged);
        toastSuccess('Workout saved!', 'Great job crushing that session.');
      } else {
        const tempWorkout = {
          ...payload,
          id: -Date.now(),
          createdAt: new Date().toISOString(),
        } as Workout;
        await addWorkoutLocally(tempWorkout);
        await addToPendingSync({ type: 'CREATE_WORKOUT', data: payload });
        dispatch(addWorkout(tempWorkout));
        const merged = mergeWorkoutIntoList(workoutsFromStore, tempWorkout);
        refreshDashboardSummary(merged);
        toastInfo('Saved offline', 'Workout will sync when you are back online.');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error finishing workout:', error);
      toastError('Error', 'Unable to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sessionCompletion = useMemo(() => {
    if (!session) {
      return 0;
    }
    return Math.round((completedExercises.size / session.exercises.length) * 100);
  }, [session, completedExercises.size]);

  if (loading || !session) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={fitnessTheme.colors.background.primary} />
        <ActivityIndicator size="large" color={fitnessTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  const sessionAccent = getWorkoutColor(session.type) ?? ACCENT_COLOR;
  const accentOverlayTint = hexToRgba('#FFFFFF', 0.12);
  const accentShadow = hexToRgba(sessionAccent, 0.35);
  const heroMetrics = [
    { label: 'Calories', value: session.estimatedCalories.toString(), icon: 'flame-outline' as const },
    { label: 'Exercises', value: session.exercises.length.toString(), icon: 'barbell-outline' as const },
    { label: 'Completed', value: `${sessionCompletion}%`, icon: 'checkmark-done-outline' as const },
  ];
  const nextExercise = session.exercises[currentExerciseIndex + 1];
  const resolvedAnimation = resolveExerciseVideo(
    currentExercise?.name,
    currentExercise?.mediaUrl ?? currentExercise?.exercise?.mediaUrl ?? null,
  );
  const animationSource = resolvedAnimation?.source ?? null;
  const isGenericClip = Boolean(resolvedAnimation?.isGeneric);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={fitnessTheme.colors.background.primary} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: sessionAccent, shadowColor: accentShadow }]}>
          <View style={[styles.heroOverlay, { backgroundColor: accentOverlayTint }]} />
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBackButton}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.heroTypePill}>{session.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTitle}>{session.name}</Text>
          <Text style={styles.heroSubtitle}>
            {session.source === 'preset' ? 'Guided session' : 'Custom workout'} ·{' '}
            {session.exercises.length} exercises
          </Text>

          <View style={styles.heroTimers}>
            <View style={styles.heroTimerPrimary}>
              <Text style={styles.heroTimerLabel}>Elapsed</Text>
              <Text style={styles.heroTimerValue}>{formatTime(elapsedTime)}</Text>
            </View>
            <View style={styles.heroTimerSecondary}>
              <Text style={styles.heroTimerLabel}>Exercise time</Text>
              <Text style={styles.heroTimerSecondaryValue}>{formatTime(exerciseElapsedTime)}</Text>
            </View>
            <View style={styles.heroTimerSecondary}>
              <Text style={styles.heroTimerLabel}>Complete</Text>
              <Text style={styles.heroTimerSecondaryValue}>{sessionCompletion}%</Text>
            </View>
          </View>

          <View style={styles.heroMetricsRow}>
            {heroMetrics.map(metric => (
              <View key={metric.label} style={styles.heroMetricCard}>
                <Ionicons name={metric.icon} size={18} color="#FFFFFF" />
                <Text style={styles.heroMetricValue}>{metric.value}</Text>
                <Text style={styles.heroMetricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.heroControlsRow}>
            <TouchableOpacity
              style={[
                styles.heroControlButton,
                { backgroundColor: '#FFFFFF' },
              ]}
              onPress={toggleTimer}>
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={20}
                color={sessionAccent}
              />
              <Text style={[styles.heroControlText, { color: sessionAccent }]}>
                {isRunning ? 'Pause session' : 'Start session'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroControlButton, styles.heroControlButtonGhost]}
              onPress={goToNextExercise}
              disabled={currentExerciseIndex >= session.exercises.length - 1}>
              <Ionicons name="play-skip-forward" size={18} color="#FFFFFF" />
              <Text style={styles.heroControlGhostText}>Next exercise</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.animationCard}>
          <View style={styles.animationHeader}>
            <Text style={styles.animationLabel}>
              {animationSource ? 'Form reference' : 'No video available'}
            </Text>
            <Text style={styles.animationExercise}>
              {animationSource ? currentExercise?.name : 'This move has no linked video yet.'}
            </Text>
          </View>
          {animationSource ? (
            <Video
              ref={animationRef}
              source={animationSource}
              key={currentExercise?.name ?? 'animation'}
              style={styles.animationVideo}
              shouldPlay
              isLooping
              isMuted
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <View style={styles.animationFallback}>
              <Ionicons name="play-circle-outline" size={32} color={fitnessTheme.colors.text.secondary} />
              <Text style={styles.animationFallbackText}>No video found for this exercise</Text>
            </View>
          )}
        </View>

        {nextExercise && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>Next up</Text>
            <View style={styles.nextContent}>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>{currentExerciseIndex + 2}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextTitle}>{nextExercise.name}</Text>
                <Text style={styles.nextMeta}>
                  {nextExercise.sets > 0
                    ? `${nextExercise.sets} sets · ${nextExercise.reps} reps`
                    : `${nextExercise.duration ?? 0} min`}
                </Text>
              </View>
              <Ionicons name="repeat-outline" size={20} color={fitnessTheme.colors.text.secondary} />
            </View>
          </View>
        )}

        <View style={styles.exerciseSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {session.exercises.map((exercise, index) => {
            const isCurrent = index === currentExerciseIndex;
            const isCompleted = completedExercises.has(index);

            return (
              <TouchableOpacity
                key={`${exercise.exerciseId}-${index}`}
                style={[
                  styles.exerciseCard,
                  isCurrent && styles.exerciseCardActive,
                  isCompleted && styles.exerciseCardCompleted,
                ]}
                activeOpacity={0.85}
                onPress={() => markExerciseComplete(index)}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {exercise.sets > 0 ? `${exercise.sets} sets · ${exercise.reps} reps` : `${exercise.duration ?? 0} min`}
                    </Text>
                  </View>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={isCompleted ? fitnessTheme.colors.success : fitnessTheme.colors.text.secondary}
                  />
                </View>
                <View style={styles.exerciseStatsRow}>
                  {exercise.weight ? (
                    <View style={styles.exerciseStat}>
                      <Ionicons name="fitness-outline" size={14} color={fitnessTheme.colors.text.secondary} />
                      <Text style={styles.exerciseStatText}>{exercise.weight} kg</Text>
                    </View>
                  ) : null}
                  <View style={styles.exerciseStat}>
                    <Ionicons name="refresh-outline" size={14} color={fitnessTheme.colors.text.secondary} />
                    <Text style={styles.exerciseStatText}>
                      {exercise.sets > 0 ? `${exercise.sets} rounds` : `${exercise.duration ?? 0} min`}
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={[styles.exerciseStat, styles.exerciseLiveStat]}>
                      <Ionicons name="time-outline" size={14} color={sessionAccent} />
                      <Text style={[styles.exerciseStatText, { color: sessionAccent }]}>
                        {formatTime(exerciseElapsedTime)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="flag" size={20} color="#FFFFFF" />
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const buildSessionFromWorkout = (workout: any): SessionData => {
  const exercises: SessionExercise[] = (workout?.exercises ?? []).map((item: any) => ({
    exerciseId: item.exerciseId ?? item.exercise?.id ?? item.id ?? Math.random(),
    name: item.exercise?.name ?? item.name ?? 'Exercise',
    sets: item.sets ?? 0,
    reps: item.reps ?? 0,
    weight: item.weight ?? 0,
    duration: item.duration ?? 0,
    notes: item.notes ?? '',
    exercise: item.exercise ? {
      mediaUrl: item.exercise.mediaUrl,
    } : null,
    mediaUrl: item.exercise?.mediaUrl ?? item.mediaUrl ?? null,
  }));

  const totalDuration =
    workout?.totalDuration ??
    exercises.reduce((sum, exercise) => sum + (exercise.duration ?? 0), 0);

  return {
    id: workout?.id,
    name: workout?.name ?? 'Workout Session',
    notes: workout?.notes ?? '',
    type: workout?.exercises?.[0]?.exercise?.type ?? 'strength',
    estimatedCalories: workout?.caloriesBurned ?? estimateCalories('strength', totalDuration || 30),
    exercises,
    source: 'existing',
  };
};

const buildSessionFromPreset = (
  preset: string,
  library: any[],
  ): SessionData => {
  const normalized = preset.toLowerCase();
  let type: SessionData['type'] = 'strength';
  let defaults = DEFAULT_STRENGTH_EXERCISES;
  let duration = 30;

  if (normalized.includes('cardio')) {
    type = 'cardio';
    defaults = DEFAULT_CARDIO_EXERCISES;
    duration = 20;
  } else if (normalized.includes('endurance')) {
    type = 'sports';
    defaults = DEFAULT_SPORTS_EXERCISES;
    duration = 30;
  } else if (normalized.includes('mobility') || normalized.includes('flex')) {
    type = 'flexibility';
    defaults = DEFAULT_MOBILITY_EXERCISES;
    duration = 25;
  } else if (normalized.includes('sport')) {
    type = 'sports';
    defaults = DEFAULT_SPORTS_EXERCISES;
    duration = 30;
  }

  const matching = library.filter(item => item.type === type);
  const pool = matching.length ? matching : library;
  const chosen = pool.slice(0, defaults.length);

  const exercises = chosen.map((exercise, index) => {
    const template = defaults[index] ?? defaults[defaults.length - 1];
    return {
      exerciseId: exercise?.id ?? index + 1,
      name: exercise?.name ?? template.name,
      sets: template.sets ?? 0,
      reps: template.reps ?? 0,
      weight: 0,
      duration: template.duration ?? 0,
      notes: '',
      exercise: exercise ? {
        mediaUrl: exercise.mediaUrl,
      } : null,
      mediaUrl: exercise?.mediaUrl ?? null,
    } as SessionExercise;
  });

  if (exercises.length === 0) {
    return {
      name: 'Quick Workout',
      notes: 'Tap edit to add exercises.',
      type,
      estimatedCalories: estimateCalories(type, duration),
      exercises: [
        {
          exerciseId: Date.now(),
          name: defaults[0].name,
          sets: defaults[0].sets ?? 0,
          reps: defaults[0].reps ?? 0,
          weight: 0,
          duration: defaults[0].duration ?? 5,
          notes: '',
        },
      ],
      source: 'preset',
    };
  }

  return {
    name:
      type === 'cardio'
        ? 'Quick Cardio Session'
        : type === 'flexibility'
        ? 'Mobility Reset Flow'
        : type === 'sports'
        ? 'Athletic Conditioning'
        : 'Strength Builder',
    notes:
      type === 'cardio'
        ? 'High-energy session focused on raising your heart rate.'
        : type === 'flexibility'
        ? 'Controlled movements to loosen tight areas.'
        : type === 'sports'
        ? 'Speed and agility drills inspired by sport training.'
        : 'Compound movements targeting major muscle groups.',
    type,
    estimatedCalories: estimateCalories(type, duration),
    exercises,
    source: 'preset',
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fitnessTheme.colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: fitnessTheme.spacing.md,
    color: fitnessTheme.colors.text.secondary,
  },
  scrollContent: {
    paddingBottom: fitnessTheme.spacing['3xl'],
  },
  heroCard: {
    margin: fitnessTheme.spacing.lg,
    padding: fitnessTheme.spacing.lg,
    borderRadius: fitnessTheme.borderRadius['2xl'],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 10,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: fitnessTheme.spacing.md,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: hexToRgba('#FFFFFF', 0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTypePill: {
    color: '#FFFFFF',
    borderColor: hexToRgba('#FFFFFF', 0.4),
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: hexToRgba('#FFFFFF', 0.85),
    marginTop: 6,
    fontSize: 15,
  },
  heroTimers: {
    flexDirection: 'row',
    marginTop: fitnessTheme.spacing.lg,
    gap: fitnessTheme.spacing.sm,
  },
  heroTimerPrimary: {
    flex: 1.2,
    backgroundColor: hexToRgba('#FFFFFF', 0.18),
    borderRadius: 20,
    padding: fitnessTheme.spacing.md,
  },
  heroTimerSecondary: {
    flex: 1,
    backgroundColor: hexToRgba('#FFFFFF', 0.1),
    borderRadius: 20,
    padding: fitnessTheme.spacing.md,
  },
  heroTimerLabel: {
    color: hexToRgba('#FFFFFF', 0.8),
    fontSize: 12,
  },
  heroTimerValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  heroTimerSecondaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    gap: fitnessTheme.spacing.sm,
    marginTop: fitnessTheme.spacing.lg,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: hexToRgba('#FFFFFF', 0.12),
    borderRadius: 16,
    padding: fitnessTheme.spacing.md,
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  heroMetricLabel: {
    color: hexToRgba('#FFFFFF', 0.8),
    fontSize: 12,
    marginTop: 2,
  },
  heroControlsRow: {
    flexDirection: 'row',
    gap: fitnessTheme.spacing.sm,
    marginTop: fitnessTheme.spacing.lg,
  },
  heroControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 12,
  },
  heroControlButtonGhost: {
    borderWidth: 1,
    borderColor: hexToRgba('#FFFFFF', 0.4),
    backgroundColor: 'transparent',
  },
  heroControlText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroControlGhostText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  nextCard: {
    marginHorizontal: fitnessTheme.spacing.lg,
    marginTop: fitnessTheme.spacing.md,
    padding: fitnessTheme.spacing.md,
    borderRadius: fitnessTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: fitnessTheme.colors.border,
    backgroundColor: fitnessTheme.colors.background.secondary,
  },
  nextLabel: {
    fontSize: 12,
    color: fitnessTheme.colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  nextContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: fitnessTheme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBadgeText: {
    fontWeight: '700',
    color: fitnessTheme.colors.text.primary,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: fitnessTheme.colors.text.primary,
  },
  nextMeta: {
    fontSize: 13,
    color: fitnessTheme.colors.text.secondary,
  },
  animationCard: {
    marginHorizontal: fitnessTheme.spacing.lg,
    marginTop: fitnessTheme.spacing.md,
    padding: fitnessTheme.spacing.md,
    borderRadius: fitnessTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: fitnessTheme.colors.border,
    backgroundColor: fitnessTheme.colors.background.secondary,
  },
  animationHeader: {
    marginBottom: fitnessTheme.spacing.sm,
  },
  animationLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: fitnessTheme.colors.text.secondary,
  },
  animationExercise: {
    fontSize: 16,
    fontWeight: '700',
    color: fitnessTheme.colors.text.primary,
  },
  animationVideo: {
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
    borderRadius: fitnessTheme.borderRadius.lg,
  },
  animationFallback: {
    height: Dimensions.get('window').width * 0.5,
    borderRadius: fitnessTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: fitnessTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fitnessTheme.colors.background.tertiary,
    paddingHorizontal: fitnessTheme.spacing.md,
  },
  animationFallbackText: {
    textAlign: 'center',
    marginTop: fitnessTheme.spacing.sm,
    color: fitnessTheme.colors.text.secondary,
    fontSize: 13,
  },
  exerciseSection: {
    paddingHorizontal: fitnessTheme.spacing.lg,
    marginTop: fitnessTheme.spacing.lg,
  },
  sectionTitle: {
    color: fitnessTheme.colors.text.primary,
    fontSize: fitnessTheme.typography.fontSize['2xl'],
    fontWeight: asFontWeight(fitnessTheme.typography.fontWeight.bold),
    marginBottom: fitnessTheme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: fitnessTheme.colors.background.tertiary,
    borderRadius: fitnessTheme.borderRadius.xl,
    padding: fitnessTheme.spacing.md,
    marginBottom: fitnessTheme.spacing.md,
    borderWidth: 1,
    borderColor: fitnessTheme.colors.border,
  },
  exerciseCardActive: {
    borderColor: fitnessTheme.colors.primary,
    backgroundColor: hexToRgba(fitnessTheme.colors.primary, 0.08),
  },
  exerciseCardCompleted: {
    borderColor: fitnessTheme.colors.success,
    backgroundColor: successOverlay,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fitnessTheme.spacing.md,
  },
  exerciseIndex: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: fitnessTheme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    color: fitnessTheme.colors.text.primary,
    fontWeight: '700',
  },
  exerciseName: {
    color: fitnessTheme.colors.text.primary,
    fontSize: fitnessTheme.typography.fontSize.lg,
    fontWeight: asFontWeight(fitnessTheme.typography.fontWeight.bold),
  },
  exerciseMeta: {
    color: fitnessTheme.colors.text.secondary,
    fontSize: fitnessTheme.typography.fontSize.sm,
    marginTop: fitnessTheme.spacing.xs,
  },
  exerciseStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fitnessTheme.spacing.md,
    marginTop: fitnessTheme.spacing.sm,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseStatText: {
    color: fitnessTheme.colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseLiveStat: {
    backgroundColor: hexToRgba(ACCENT_COLOR, 0.12),
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: fitnessTheme.spacing.lg,
    paddingBottom: fitnessTheme.spacing.lg,
    paddingTop: fitnessTheme.spacing.md,
    backgroundColor: fitnessTheme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: fitnessTheme.colors.border,
  },
  finishButton: {
    borderRadius: fitnessTheme.borderRadius['2xl'],
    paddingVertical: fitnessTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: fitnessTheme.spacing.sm,
    backgroundColor: ACCENT_COLOR,
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: fitnessTheme.typography.fontSize.base,
    fontWeight: asFontWeight(fitnessTheme.typography.fontWeight.bold),
  },
});

export default WorkoutSession;
