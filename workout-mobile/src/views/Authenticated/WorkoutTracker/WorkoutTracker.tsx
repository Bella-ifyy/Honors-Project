import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { StackProps } from '@navigator';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '@utils/store';
import {
  setWorkouts,
  setLoading,
  type Workout as WorkoutEntity,
  type WorkoutExercise,
} from '@modules/workout/workout.slice';
import { workoutApi } from '@modules/workout/workout.api';
import fitnessTheme, { getWorkoutColor } from '@theme/fitness.theme';
import { colors as appColors } from '@theme/colors';
import { toastError, toastSuccess } from '@utils/toast';

type CategoryKey = 'all' | 'strength' | 'cardio' | 'flexibility' | 'sports';

type WorkoutHistoryItem = {
  id: number;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports';
  difficulty: string;
  totalDuration: number;
  caloriesBurned: number;
  isCompleted: boolean;
  date: string;
  exercises: WorkoutExercise[];
};

type RoutineTemplate = {
  id: number;
  name: string;
  description?: string;
  type?: string;
  difficulty: string;
  estimatedDuration: number;
  estimatedCalories: number;
  isPreDefined: boolean;
  isFavorite?: boolean;
  exercises: any[];
};

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const palette = {
  background: fitnessTheme.colors.background.primary,
  surface: fitnessTheme.colors.background.tertiary,
  elevated: fitnessTheme.colors.background.elevated,
  border: fitnessTheme.colors.border,
  accent: appColors.primaryBlue,
  accentSoft: appColors.accentSky,
  textPrimary: fitnessTheme.colors.text.primary,
  textSecondary: fitnessTheme.colors.text.secondary,
  textMuted: fitnessTheme.colors.text.tertiary,
  surfaceMuted: fitnessTheme.colors.background.tertiary,
};

const primaryAccent = palette.accent;
const successColor = fitnessTheme.colors.success;
const categoryKeys: CategoryKey[] = ['all', 'strength', 'cardio', 'flexibility', 'sports'];

const buildAccent = (type?: string, completed = false) => {
  const base = completed ? successColor : getWorkoutColor(type) ?? primaryAccent;
  return {
    base,
    tint: hexToRgba(base, completed ? 0.24 : 0.14),
    border: hexToRgba(base, completed ? 0.55 : 0.3),
  };
};

const isWorkoutCategory = (value: string): value is Exclude<CategoryKey, 'all'> =>
  ['strength', 'cardio', 'flexibility', 'sports'].includes(value);

const getCategoryTheme = (key: CategoryKey) => {
  const baseColor = key === 'all' ? palette.accent : getWorkoutColor(key) ?? palette.accent;
  return {
    base: baseColor,
    shadow: hexToRgba(baseColor, 0.35),
    iconBg: hexToRgba('#FFFFFF', 0.2),
    pillBg: hexToRgba('#FFFFFF', 0.18),
    overlay: hexToRgba('#FFFFFF', 0.08),
    textOnColor: appColors.white,
  };
};

const getStatusBadgeBackground = (completed: boolean, type?: string) =>
  completed ? buildAccent(type, true).tint : palette.surfaceMuted;

const getTemplateBadgeBackground = (type?: string) => buildAccent(type).tint;

interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports';
  duration: number;
  calories: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  date: string;
  exercises?: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
}

const WorkoutTracker = ({ navigation, route }: StackProps<'WorkoutTrackerStack'>) => {
  const dispatch = useDispatch();
  const loadingWorkouts = useSelector((state: State) => state.workout.loading);
  const [refreshing, setRefreshing] = useState(false);
  const [predefinedTemplates, setPredefinedTemplates] = useState<RoutineTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<RoutineTemplate[]>([]);
  const [favoriteRoutineIds, setFavoriteRoutineIds] = useState<number[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [hasHydratedWorkouts, setHasHydratedWorkouts] = useState(false);
  const [reminder, setReminder] = useState<{ enabled: boolean; timeOfDay: string | null; days?: string[] }>({
    enabled: false,
    timeOfDay: null,
    days: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'strength' | 'cardio' | 'flexibility' | 'sports' | null
  >(null);

  useEffect(() => {
    const preset = route?.params?.preset as string | undefined;
    if (!preset) {
      return;
    }
    switch (preset.toLowerCase()) {
      case 'strength':
        setActiveCategory('strength');
        break;
      case 'cardio':
        setActiveCategory('cardio');
        break;
      case 'mobility':
      case 'flexibility':
        setActiveCategory('flexibility');
        break;
      case 'sports':
        setActiveCategory('sports');
        break;
      default:
        setActiveCategory('all');
    }
  }, [navigation, route?.params?.preset]);

  const loadReminder = async () => {
    try {
      const res = await workoutApi.getReminder();
      setReminder({
        enabled: !!res?.enabled,
        timeOfDay: res?.timeOfDay ?? null,
        days: res?.days ?? [],
      });
    } catch (error) {
      console.warn('Reminder load failed', error);
    }
  };

  const toggleReminder = async () => {
    const next = !reminder.enabled;
    const payload = {
      enabled: next,
      timeOfDay: reminder.timeOfDay ?? '07:00',
      days: reminder.days && reminder.days.length ? reminder.days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    };
    try {
      const res = await workoutApi.setReminder(payload);
      setReminder({
        enabled: !!res?.enabled,
        timeOfDay: res?.timeOfDay ?? payload.timeOfDay,
        days: res?.days ?? payload.days,
      });
      toastSuccess(next ? 'Reminder on' : 'Reminder off');
    } catch (error) {
      console.error('Reminder toggle failed', error);
      toastError('Error', 'Could not update reminder');
    }
  };

  const normalizeListResponse = (payload: any): any[] => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    if (Array.isArray(payload?.items)) {
      return payload.items;
    }
    return [];
  };

  const fetchWorkouts = async () => {
    try {
      dispatch(setLoading(true));
      console.log('🔍 Fetching workouts from API...');
      const apiResponse = await workoutApi.listWorkouts();
      const workoutsData = normalizeListResponse(apiResponse);
      console.log('✅ Workouts fetched successfully:', workoutsData.length, 'workouts');
      if (!Array.isArray(apiResponse)) {
        console.warn('⚠️ Unexpected workouts payload shape, coercing to list');
      }

      const enriched: WorkoutHistoryItem[] = workoutsData.map((workout: any) => ({
        id: Number(workout.id),
        name: workout.name || 'Workout',
        type: (workout.exercises?.[0]?.exercise?.type as WorkoutHistoryItem['type']) || 'strength',
        difficulty: (workout.exercises?.[0]?.exercise?.difficulty ?? 'custom').toLowerCase(),
        totalDuration: workout.totalDuration || 0,
        caloriesBurned: workout.caloriesBurned || 0,
        isCompleted: Boolean(workout.isCompleted),
        date: new Date(workout.date).toISOString().split('T')[0],
        exercises: (workout.exercises ?? []).map((we: any, index: number): WorkoutExercise => ({
          id: Number(we.id ?? index),
          exerciseId: Number(we.exerciseId ?? we.exercise?.id ?? index),
          sets: we.sets ?? 0,
          reps: we.reps ?? 0,
          weight: we.weight ?? 0,
          duration: we.duration ?? 0,
          orderIndex: we.orderIndex ?? index,
          notes: we.notes ?? '',
          exercise: we.exercise,
        })),
      }));

      const storeWorkouts: WorkoutEntity[] = enriched.map(workout => ({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        totalDuration: workout.totalDuration,
        caloriesBurned: workout.caloriesBurned,
        isCompleted: workout.isCompleted,
        exercises: workout.exercises,
        notes: undefined,
      }));

      setWorkoutHistory(enriched);
      dispatch(setWorkouts(storeWorkouts));
    } catch (error: any) {
      console.error('❌ Error fetching workouts:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Status code:', error.response?.status);
      Alert.alert('Workouts', 'Unable to refresh workouts right now. Showing last saved list.');
    } finally {
      dispatch(setLoading(false));
      setHasHydratedWorkouts(true);
    }
  };

  const fetchTemplates = async () => {
    try {
      const routinesResponse = await workoutApi.listRoutines();
      const routines = normalizeListResponse(routinesResponse);
      if (!Array.isArray(routinesResponse)) {
        console.warn('⚠️ Unexpected templates payload shape, coercing to list');
      }

      const mapped: RoutineTemplate[] = routines.map((routine: any) => ({
        ...routine,
        type: routine.exercises?.[0]?.exercise?.type ?? 'strength',
        estimatedDuration: routine.estimatedDuration ?? 0,
        estimatedCalories: routine.estimatedCalories ?? 0,
        difficulty: (routine.difficulty ?? 'custom').toLowerCase(),
        isPreDefined: routine.isPreDefined ?? false,
        isFavorite: !!routine.isFavorite,
        exercises: routine.exercises ?? [],
      }));

      setPredefinedTemplates(mapped.filter(item => item.isPreDefined));
      setCustomTemplates(mapped.filter(item => !item.isPreDefined));
      setFavoriteRoutineIds(
        mapped.filter(item => item.isFavorite).map(item => Number(item.id)),
      );
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      setPredefinedTemplates([]);
      setCustomTemplates([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
      fetchTemplates();
      loadReminder();
    }, []),
  );

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWorkouts(), fetchTemplates(), loadReminder()]);
    setRefreshing(false);
  };

  const selectedCategory = (activeCategory ?? 'all') as 'all' | 'strength' | 'cardio' | 'flexibility' | 'sports';

  const filteredWorkouts = useMemo(() => {
    let filtered = workoutHistory;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(workout => workout.name.toLowerCase().includes(term));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(workout => workout.type === selectedCategory);
    }

    return filtered;
  }, [workoutHistory, searchTerm, selectedCategory]);

  const filterTemplates = useCallback(
    (list: RoutineTemplate[], category: 'all' | 'strength' | 'cardio' | 'flexibility' | 'sports') =>
      list.filter(template => {
        const typeKey = (template.type ?? '').toLowerCase();
        const matchesType = category === 'all' || typeKey === category.toLowerCase();

        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          query.length === 0 ||
          template.name?.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query);

        return matchesType && matchesSearch;
      }),
    [searchTerm],
  );

  const filteredPredefinedTemplates = filterTemplates(predefinedTemplates, selectedCategory);
  const filteredCustomTemplates = filterTemplates(customTemplates, selectedCategory);
  const heroAccent = buildAccent('strength');
  const detailTheme = useMemo(() => getCategoryTheme(selectedCategory), [selectedCategory]);
  const categories = useMemo(
    () => [
      {
        key: 'all' as const,
        label: 'All workouts',
        subtitle: 'Every track in one place',
        icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
      },
      {
        key: 'strength' as const,
        label: 'Strength',
        subtitle: 'Power & lifting',
        icon: 'barbell' as keyof typeof Ionicons.glyphMap,
      },
      {
        key: 'cardio' as const,
        label: 'Cardio',
        subtitle: 'Endurance & HIIT',
        icon: 'heart' as keyof typeof Ionicons.glyphMap,
      },
      {
        key: 'flexibility' as const,
        label: 'Mobility',
        subtitle: 'Stretch & restore',
        icon: 'body' as keyof typeof Ionicons.glyphMap,
      },
      {
        key: 'sports' as const,
        label: 'Sports',
        subtitle: 'Athletic circuits',
        icon: 'football' as keyof typeof Ionicons.glyphMap,
      },
    ],
    [],
  );

  const categoryStats = useMemo(() => {
    const baseStats = categoryKeys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: { workouts: 0, templates: 0 },
      }),
      {} as Record<CategoryKey, { workouts: number; templates: number }>,
    );

    baseStats.all.workouts = workoutHistory.length;
    baseStats.all.templates = predefinedTemplates.length + customTemplates.length;

    workoutHistory.forEach(workout => {
      if (isWorkoutCategory(workout.type)) {
        baseStats[workout.type].workouts += 1;
      }
    });

    [...predefinedTemplates, ...customTemplates].forEach(template => {
      const typeKey = (template.type ?? '').toLowerCase();
      if (isWorkoutCategory(typeKey)) {
        baseStats[typeKey].templates += 1;
      }
    });

    return baseStats;
  }, [workoutHistory, predefinedTemplates, customTemplates]);

  const savedSnapshot = useMemo(() => {
    const totalMinutes = workoutHistory.reduce((sum, workout) => sum + (workout.totalDuration || 0), 0);
    const avgDuration = workoutHistory.length ? Math.round(totalMinutes / workoutHistory.length) : 0;
    const completed = workoutHistory.filter(workout => workout.isCompleted).length;
    return [
      { label: 'Active streak', value: `${completed}`, icon: 'flash-outline' as keyof typeof Ionicons.glyphMap },
      { label: 'Avg. session', value: `${avgDuration}m`, icon: 'time-outline' as keyof typeof Ionicons.glyphMap },
      { label: 'Templates saved', value: `${customTemplates.length}`, icon: 'albums-outline' as keyof typeof Ionicons.glyphMap },
    ];
  }, [workoutHistory, customTemplates.length]);

  const convertTemplateToWorkoutPayload = (template: any) => ({
    id: template.id,
    name: template.name,
    date: new Date().toISOString(),
    totalDuration: template.estimatedDuration ?? 0,
    caloriesBurned: template.estimatedCalories ?? 0,
    exercises: (template.exercises ?? []).map((item: any, index: number) => ({
      id: item.id ?? item.exerciseId ?? index,
      exerciseId: item.exerciseId,
      exercise: item.exercise,
      sets: item.targetSets ?? 0,
      reps: item.targetReps ?? 0,
      weight: item.targetWeight ?? 0,
      duration: item.targetDuration ?? 0,
      orderIndex: item.orderIndex ?? index,
    })),
  });

  const handleStartTemplate = (template: any) => {
    const workoutPayload = convertTemplateToWorkoutPayload(template);
    navigation.navigate('WorkoutSessionStack', { workoutData: workoutPayload });
  };

  const handleCustomizeTemplate = (template: any) => {
    if (template.isPreDefined) {
      navigation.navigate('CreateWorkoutStack', {
        template,
        mode: 'clone',
      });
    } else {
      navigation.navigate('CreateWorkoutStack', {
        templateId: template.id,
        template,
        mode: 'edit',
      });
    }
  };

  const toggleTemplateFavorite = async (templateId: number) => {
    try {
      const res = await workoutApi.toggleRoutineFavorite(templateId);
      const isFavorite = !!res?.isFavorite;
      setFavoriteRoutineIds(prev =>
        isFavorite ? Array.from(new Set([...prev, templateId])) : prev.filter(id => id !== templateId),
      );
      const applyFlag = (list: RoutineTemplate[]) =>
        list.map(item => (item.id === templateId ? { ...item, isFavorite } : item));
      setPredefinedTemplates(applyFlag);
      setCustomTemplates(applyFlag);
    } catch (error) {
      console.error('Favorite toggle error', error);
      toastError('Error', 'Could not update favorite');
    }
  };

  const renderTemplateSection = (title: string, templates: any[]) => (
    <View style={styles.templateSection}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {templates.length === 0 ? (
        <Text style={styles.emptyTemplateText}>No templates available yet.</Text>
      ) : (
        templates.map(template => {
          const accent = buildAccent(template.type);
          return (
            <View
              key={`${template.isPreDefined ? 'pre' : 'custom'}-${template.id}`}
              style={[
                styles.templateCard,
                {
                  borderColor: accent.border,
                },
              ]}>
              <View style={[styles.templateColorBar, { backgroundColor: accent.base }]} />
              <View style={[styles.templateBackdrop, { backgroundColor: accent.tint }]} />
              <View style={styles.templateCardHeader}>
                <View style={styles.templateTitleBlock}>
                  <Text style={styles.templateTitle}>{template.name}</Text>
                  {template.description ? (
                    <Text style={styles.templateSubtitle} numberOfLines={2}>
                      {template.description}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.templateRight}>
                  <View
                    style={[
                      styles.templateBadge,
                      { backgroundColor: getTemplateBadgeBackground(template.type) },
                    ]}>
                    <Text
                      style={[
                        styles.templateBadgeText,
                        { color: accent.base },
                      ]}>
                      {template.difficulty?.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoritePill}
                    onPress={() => toggleTemplateFavorite(template.id)}>
                    <Ionicons
                      name={favoriteRoutineIds.includes(Number(template.id)) ? 'heart' : 'heart-outline'}
                      size={18}
                      color={accent.base}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.templateStatsRow}>
                <View style={styles.templateStat}>
                  <Ionicons name="time-outline" size={16} color={palette.textPrimary} />
                  <Text style={styles.templateStatText}>
                    {template.estimatedDuration ?? 0} min
                  </Text>
                </View>
                <View style={styles.templateStat}>
                  <Ionicons name="flame-outline" size={16} color={palette.textPrimary} />
                  <Text style={styles.templateStatText}>
                    {template.estimatedCalories ?? 0} cal
                  </Text>
                </View>
                <View style={styles.templateStat}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color={palette.textPrimary} />
                  <Text style={styles.templateStatText}>
                    {(template.exercises ?? []).length} moves
                  </Text>
                </View>
              </View>

              <View style={styles.templateActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.templateActionButton,
                    styles.templatePrimaryAction,
                    { backgroundColor: accent.base },
                  ]}
                  onPress={() => handleStartTemplate(template)}>
                  <Ionicons name="play" size={18} color={appColors.white} />
                  <Text style={styles.templatePrimaryActionText}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.templateActionButton,
                    styles.templateSecondaryAction,
                    { borderColor: accent.border },
                  ]}
                  onPress={() => handleCustomizeTemplate(template)}>
                  <Ionicons
                    name={template.isPreDefined ? 'color-wand' : 'create-outline'}
                    size={18}
                    color={palette.textPrimary}
                  />
                  <Text style={styles.templateActionText}>
                    {template.isPreDefined ? 'Customize' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  const getWorkoutTypeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type) {
      case 'strength':
        return 'dumbbell';
      case 'cardio':
        return 'heart-pulse';
      case 'flexibility':
        return 'meditation';
      case 'sports':
        return 'basketball';
      default:
        return 'run';
    }
  };

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return '#22C55E';
    case 'intermediate':
      return '#F7901E';
    case 'advanced':
      return '#F87171';
    default:
      return palette.accent;
  }
};

  const renderWorkoutItem = useCallback(
    ({ item }: { item: WorkoutHistoryItem }) => {
      const difficultyColor = getDifficultyColor(item.difficulty || 'custom');
      const accent = buildAccent(item.type, item.isCompleted);
      return (
        <TouchableOpacity
          style={[
            styles.workoutCard,
            {
              borderColor: accent.border,
              shadowColor: hexToRgba(accent.base, 0.25),
            },
          ]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('WorkoutSessionStack', { workoutId: item.id })}
          onLongPress={() => navigation.navigate('WorkoutDetailStack', { workoutId: item.id })}>
          <View style={[styles.workoutTone, { backgroundColor: accent.tint }]} />
          <View style={styles.workoutHeader}>
            <View
              style={[
                styles.workoutIconContainer,
                { backgroundColor: hexToRgba(accent.base, item.isCompleted ? 0.28 : 0.14) },
              ]}>
              <MaterialCommunityIcons
                name={getWorkoutTypeIcon(item.type)}
                size={24}
                color={accent.base}
              />
            </View>
            <View style={styles.workoutContent}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.workoutTitle} numberOfLines={1}>
                  {item.name || 'Unnamed Workout'}
                </Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor: difficultyColor,
                    },
                  ]}>
                  <Text style={styles.difficultyText}>
                    {(item.difficulty || 'custom').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color={palette.textSecondary} />
                  <Text style={styles.statText}>{item.totalDuration || 0} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={14} color={palette.textSecondary} />
                  <Text style={styles.statText}>{item.caloriesBurned || 0} cal</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={14} color={palette.textSecondary} />
                  <Text style={styles.statText}>{item.date || 'No date'}</Text>
                </View>
              </View>
              <View style={styles.workoutFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBadgeBackground(item.isCompleted, item.type) },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.isCompleted ? accent.base : palette.textPrimary },
                    ]}>
                    {item.isCompleted ? 'COMPLETED' : 'PENDING'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  const isInitialLoading = !hasHydratedWorkouts && loadingWorkouts;
  const backgroundRefreshing = hasHydratedWorkouts && loadingWorkouts;

  if (isInitialLoading) {
    return (
      <View style={[styles.container, styles.loadingScreen]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.loadingLabel}>Loading your workouts…</Text>
      </View>
    );
  }

  const renderHistoryContent = () => {
    if (!filteredWorkouts.length) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="dumbbell" size={80} color={palette.textMuted} />
          <Text style={styles.emptyStateText}>No workouts yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start any template to save your first session.
          </Text>
        </View>
      );
    }

    return filteredWorkouts.map(workout => (
      <View key={workout.id} style={styles.historyItemWrapper}>
        {renderWorkoutItem({ item: workout })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={palette.background} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            activeCategory !== null ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.accent}
                colors={[palette.accent]}
              />
            ) : undefined
          }>
          {activeCategory === null ? (
            <>
              <View style={styles.heroSection}>
                <View
                  style={[
                    styles.heroCard,
                    {
                      backgroundColor: heroAccent.base,
                      borderColor: 'transparent',
                      shadowColor: hexToRgba(heroAccent.base, 0.45),
                    },
                  ]}>
                  <View style={[styles.heroTone, { backgroundColor: hexToRgba('#FFFFFF', 0.12) }]} />
                  <View style={styles.heroCopy}>
                    <Text style={[styles.heroEyebrow, styles.heroEyebrowOnAccent]}>TRAINING HUB</Text>
                    <Text style={[styles.heroTitle, styles.heroTitleOnAccent]}>Workouts</Text>
                    <Text style={[styles.heroSubtitle, styles.heroSubtitleOnAccent]}>
                      Launch a curated track or jump back into a saved plan.
                    </Text>
                  </View>
              <View style={[styles.heroStat, styles.heroStatOnAccent]}>
                <Ionicons name="flame-outline" size={20} color={appColors.white} />
                <Text style={styles.heroStatText}>{workoutHistory.length} saved</Text>
              </View>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroPrimaryAction}
                onPress={() => navigation.navigate('PlanBuilderStack' as never)}>
                <Ionicons name='rocket-outline' size={18} color={appColors.white} />
                <Text style={styles.heroPrimaryActionText}>Start new plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryAction}
                onPress={() => navigation.navigate('ExerciseLibraryStack' as never)}>
                <Text style={styles.heroSecondaryActionText}>Browse library</Text>
                <Ionicons name='chevron-forward' size={16} color={appColors.primaryBlue} />
              </TouchableOpacity>
            </View>
          </View>

              <View style={styles.reminderCard}>
                <View>
                  <Text style={styles.reminderTitle}>Stay on track</Text>
                  <Text style={styles.reminderSubtitle}>
                    {reminder.enabled
                      ? `Reminder at ${reminder.timeOfDay || '07:00'}`
                      : 'Set a daily nudge to keep your streak'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.reminderToggle} onPress={() => toggleReminder()}>
                  <Ionicons
                    name={reminder.enabled ? 'notifications' : 'notifications-off-outline'}
                    size={18}
                    color={appColors.white}
                  />
                  <Text style={styles.reminderToggleText}>
                    {reminder.enabled ? 'On' : 'Enable'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.savedSpotlight}>
                <View style={[styles.savedSpotlightAccent, { backgroundColor: heroAccent.base }]} />
                <View style={styles.savedSpotlightHeader}>
                  <View>
                    <Text style={styles.savedLabel}>Saved workouts</Text>
                    <View style={styles.savedCountRow}>
                      <Text style={styles.savedCount}>{workoutHistory.length}</Text>
                      <Text style={styles.savedCountSuffix}>plans</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.savedAction}
                    onPress={() => navigation.navigate('CreateWorkoutStack', { from: 'WorkoutTracker' })}>
                    <Ionicons name="add" size={18} color={appColors.white} />
                    <Text style={styles.savedActionText}>New</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.savedMetaRow}>
                  <View style={[styles.savedMetaPill, styles.savedMetaPillFeatured]}>
                    <Text style={styles.savedMetaLabel}>Featured</Text>
                    <Text style={styles.savedMetaValue}>{predefinedTemplates.length}</Text>
                  </View>
                  <View style={[styles.savedMetaPill, styles.savedMetaPillCustom]}>
                    <Text style={styles.savedMetaLabel}>Custom</Text>
                    <Text style={styles.savedMetaValue}>{customTemplates.length}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.categoryIntro}>
                <Text style={styles.categoryIntroLabel}>Pick a focus</Text>
                <Text style={styles.categoryIntroSubtitle}>
                  Choose a workout lane to browse templates and history tailored to it.
                </Text>
              </View>

              <View style={styles.categoryGrid}>
                {categories.map(category => {
                  const theme = getCategoryTheme(category.key);
                  const stats = categoryStats[category.key];
                  return (
                    <TouchableOpacity
                      key={category.key}
                      activeOpacity={0.9}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: theme.base,
                          shadowColor: theme.shadow,
                        },
                      ]}
                      onPress={() => setActiveCategory(category.key)}>
                      <View style={[styles.categoryCardTone, { backgroundColor: theme.overlay }]} />
                      <View style={styles.categoryCardHeader}>
                        <View style={[styles.categoryIconWrap, { backgroundColor: theme.iconBg }]}>
                          <Ionicons name={category.icon} size={20} color={theme.textOnColor} />
                        </View>
                        <View style={styles.categoryCopy}>
                          <Text style={[styles.categoryLabel, styles.categoryLabelOnColor]}>
                            {category.label}
                          </Text>
                          <Text style={[styles.categorySubtitle, styles.categorySubtitleOnColor]}>
                            {category.subtitle}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textOnColor} />
                      </View>
                      <View style={styles.categoryMetaRow}>
                        <View style={[styles.categoryMetaPill, { backgroundColor: theme.pillBg }]}>
                          <Text style={styles.categoryMetaValue}>{stats.workouts}</Text>
                          <Text style={styles.categoryMetaLabel}>Workouts</Text>
                        </View>
                        <View style={[styles.categoryMetaPill, { backgroundColor: theme.pillBg }]}>
                          <Text style={styles.categoryMetaValue}>{stats.templates}</Text>
                          <Text style={styles.categoryMetaLabel}>Templates</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.savedSnapshotRow}>
                {savedSnapshot.map(metric => (
                  <View key={metric.label} style={styles.savedSnapshotCard}>
                    <View style={styles.savedSnapshotIcon}>
                      <Ionicons name={metric.icon} size={16} color={palette.textPrimary} />
                    </View>
                    <Text style={styles.savedSnapshotValue}>{metric.value}</Text>
                    <Text style={styles.savedSnapshotLabel}>{metric.label}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.detailHero,
                  {
                    backgroundColor: detailTheme.base,
                    shadowColor: detailTheme.shadow,
                  },
                ]}>
                <View style={styles.detailHeroHeader}>
                  <TouchableOpacity style={styles.detailBackButton} onPress={() => setActiveCategory(null)}>
                    <Ionicons name="arrow-back" size={20} color={detailTheme.textOnColor} />
                  </TouchableOpacity>
                <Text style={[styles.detailCategoryChip, { color: detailTheme.textOnColor, borderColor: hexToRgba(detailTheme.textOnColor, 0.35) }]}>
                  {selectedCategory === 'all' ? 'Full library' : selectedCategory}
                </Text>
              </View>
                <Text style={[styles.detailHeroTitle, { color: detailTheme.textOnColor }]}>
                  {categories.find(cat => cat.key === selectedCategory)?.label ?? 'Workouts'}
                </Text>
                <Text style={[styles.detailHeroSubtitle, { color: hexToRgba(detailTheme.textOnColor, 0.85) }]}>
                  {categories.find(cat => cat.key === selectedCategory)?.subtitle ?? ''}
                </Text>
                <View style={styles.detailHeroStatsRow}>
                  <View style={styles.detailHeroStat}>
                    <Text style={[styles.detailHeroStatValue, { color: detailTheme.textOnColor }]}>
                      {categoryStats[selectedCategory].workouts}
                    </Text>
                    <Text style={[styles.detailHeroStatLabel, { color: hexToRgba(detailTheme.textOnColor, 0.8) }]}>
                      Workouts logged
                    </Text>
                  </View>
                  <View style={styles.detailHeroStat}>
                    <Text style={[styles.detailHeroStatValue, { color: detailTheme.textOnColor }]}>
                      {categoryStats[selectedCategory].templates}
                    </Text>
                    <Text style={[styles.detailHeroStatLabel, { color: hexToRgba(detailTheme.textOnColor, 0.8) }]}>
                      Templates
                    </Text>
                  </View>
                </View>
                <View style={styles.detailHeroActions}>
                  <TouchableOpacity
                    style={[styles.detailHeroButton, styles.detailHeroButtonPrimary]}
                    onPress={() =>
                      navigation.navigate('CreateWorkoutStack', {
                        from: 'WorkoutTracker',
                        preset: selectedCategory,
                      })
                    }>
                    <Ionicons name="pulse-outline" size={18} color={detailTheme.textOnColor} />
                    <Text style={[styles.detailHeroButtonPrimaryText, { color: detailTheme.textOnColor }]}>Log workout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailHeroButton, styles.detailHeroButtonSecondary]}
                    onPress={() => navigation.navigate('WorkoutSessionStack', { preset: selectedCategory })}>
                    <Text style={[styles.detailHeroButtonSecondaryText, { color: detailTheme.textOnColor }]}>
                      Start session
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={detailTheme.textOnColor} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.searchContainer, styles.detailSearch]}>
                <Ionicons name="search-outline" size={20} color={palette.textMuted} style={styles.searchIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search workouts & templates..."
                  placeholderTextColor={palette.textMuted}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
              </View>

              {(filteredPredefinedTemplates.length > 0 || filteredCustomTemplates.length > 0) && (
                <View style={styles.sectionStack}>
                  {filteredPredefinedTemplates.length > 0 &&
                    renderTemplateSection('Featured templates', filteredPredefinedTemplates)}
                  {filteredCustomTemplates.length > 0 &&
                    renderTemplateSection('Your templates', filteredCustomTemplates)}
                </View>
              )}

              <View style={styles.historySection}>
                <View style={styles.sectionHeadingRow}>
                  <View>
                    <Text style={styles.sectionHeading}>Saved workouts</Text>
                    <Text style={styles.sectionSubheading}>Sorted by most recent activity</Text>
                  </View>
                  <View style={styles.sectionHeadingExtras}>
                    {backgroundRefreshing && (
                      <ActivityIndicator size="small" color={palette.accent} style={styles.sectionSpinner} />
                    )}
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>{filteredWorkouts.length}</Text>
                    </View>
                  </View>
                </View>
                {renderHistoryContent()}
              </View>
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateWorkoutStack', { from: 'WorkoutTracker' })}>
          <Ionicons name="add" size={28} color={appColors.white} />
        </TouchableOpacity>
      </View>
  );
};

export default WorkoutTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  heroTone: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  heroStat: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroStatText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  heroPrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: appColors.primaryBlue,
  },
  heroPrimaryActionText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  heroSecondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.primaryBlue,
    backgroundColor: hexToRgba(appColors.primaryBlue, 0.08),
  },
  heroSecondaryActionText: {
    color: appColors.primaryBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: hexToRgba(appColors.primaryBlue, 0.18),
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  reminderSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: palette.textSecondary,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: appColors.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reminderToggleText: { color: appColors.white, fontWeight: '700' },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: palette.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroEyebrowOnAccent: {
    color: hexToRgba('#FFFFFF', 0.8),
  },
  heroTitleOnAccent: {
    color: appColors.white,
  },
  heroSubtitleOnAccent: {
    color: hexToRgba('#FFFFFF', 0.9),
  },
  heroStatOnAccent: {
    backgroundColor: hexToRgba('#FFFFFF', 0.18),
  },
  savedSpotlight: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  savedSpotlightAccent: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.08,
    right: -60,
    top: -40,
  },
  savedSpotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  savedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savedCountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
    gap: 6,
  },
  savedCount: {
    fontSize: 42,
    fontWeight: '800',
    color: palette.textPrimary,
    letterSpacing: -1,
  },
  savedCountSuffix: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textSecondary,
    marginBottom: 6,
  },
  savedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  savedActionText: {
    color: appColors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  savedMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  savedMetaPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: palette.surfaceMuted,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  savedMetaPillFeatured: {
    backgroundColor: hexToRgba(appColors.primaryBlue, 0.08),
  },
  savedMetaPillCustom: {
    backgroundColor: hexToRgba(appColors.accentYellow, 0.16),
  },
  savedMetaLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  savedMetaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginTop: 2,
  },
  savedSnapshotRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  savedSnapshotCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'flex-start',
  },
  savedSnapshotIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  savedSnapshotValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  savedSnapshotLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  categoryGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  categoryCard: {
    borderRadius: 28,
    padding: 20,
    gap: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 0,
  },
  categoryCardTone: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCopy: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryLabelOnColor: {
    color: appColors.white,
  },
  categorySubtitle: {
    fontSize: 13,
    marginTop: 2,
    color: palette.textSecondary,
  },
  categorySubtitleOnColor: {
    color: hexToRgba('#FFFFFF', 0.8),
  },
  categoryMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryMetaPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryMetaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: appColors.white,
  },
  categoryMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: hexToRgba('#FFFFFF', 0.85),
  },
  categoryIntro: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryIntroLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  categoryIntroSubtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 4,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeaderCopy: {
    flex: 1,
  },
  listHeaderLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 2,
  },
  listHeaderStats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listHeaderStatPill: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  listHeaderStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  listHeaderStatLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
  },
  detailHero: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 8,
  },
  detailHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailBackButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hexToRgba('#FFFFFF', 0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCategoryChip: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  detailHeroTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  detailHeroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  detailHeroStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  detailHeroStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: hexToRgba('#000000', 0.15),
  },
  detailHeroStatValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  detailHeroStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailHeroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  detailHeroButton: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  detailHeroButtonPrimary: {
    borderWidth: 1,
    borderColor: hexToRgba('#FFFFFF', 0.4),
  },
  detailHeroButtonSecondary: {
    backgroundColor: hexToRgba('#000000', 0.15),
  },
  detailHeroButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailHeroButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailSearch: {
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  templateSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  templateCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  templateColorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  templateBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    borderRadius: 18,
  },
  templateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  templateTitleBlock: {
    flex: 1,
    gap: 4,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  templateSubtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  templateBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  templateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: 0.5,
  },
  templateRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  favoritePill: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: hexToRgba(appColors.primaryBlue, 0.08),
  },
  templateStatsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  templateActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  templateActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  templatePrimaryAction: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  templatePrimaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: appColors.white,
  },
  templateSecondaryAction: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  templateActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  emptyTemplateText: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionStack: {
    paddingHorizontal: 20,
    gap: 18,
    marginBottom: 24,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionHeadingExtras: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionSubheading: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 4,
  },
  sectionBadge: {
    minWidth: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  sectionSpinner: {
    marginRight: 4,
  },
  historyItemWrapper: {
    marginBottom: 12,
  },
  workoutCard: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  workoutTone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 14,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutContent: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: palette.textPrimary,
    fontWeight: '600',
    marginLeft: 4,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.textPrimary,
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.accent,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
