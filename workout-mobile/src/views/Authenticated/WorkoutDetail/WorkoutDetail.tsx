import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { StackProps } from '@navigator';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { workoutApi } from '@modules/workout/workout.api';
import fitnessTheme, { getWorkoutColor } from '@theme/fitness.theme';
import { colors as appColors } from '@theme/colors';
import { toastError, toastSuccess } from '@utils/toast';
import { ConfirmSheet } from '@components/ConfirmSheet';

const palette = {
  background: fitnessTheme.colors.background.primary,
  surface: fitnessTheme.colors.background.elevated,
  textPrimary: fitnessTheme.colors.text.primary,
  textSecondary: fitnessTheme.colors.text.secondary,
  accent: fitnessTheme.colors.primary,
  accentSoft: fitnessTheme.colors.accent,
  border: fitnessTheme.colors.border,
};

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildAccent = (type?: string) => {
  const base = getWorkoutColor(type) ?? palette.accent;
  return {
    base,
    tint: hexToRgba(base, 0.15),
    border: hexToRgba(base, 0.3),
  };
};

const WorkoutDetail = ({ navigation, route }: StackProps<'WorkoutDetailStack'>) => {
  const { workoutId } = route.params as { workoutId: number };
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId, navigation]);

  const fetchWorkoutDetails = async () => {
    try {
      setLoading(true);
      const data = await workoutApi.getWorkout(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Error fetching workout details:', error);
      toastError('Error', 'Failed to load workout details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await workoutApi.deleteWorkout(workoutId);
      toastSuccess('Workout deleted');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toastError('Error', 'Failed to delete workout');
    } finally {
      setConfirmDeleteVisible(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateWorkoutStack', {
      workoutId: workoutId,
      workoutData: workout,
      isEdit: true,
    });
  };

  const handleStart = () => {
    navigation.navigate('WorkoutSessionStack', { workoutId });
  };

  const getWorkoutTypeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type?.toLowerCase()) {
      case 'cardio':
        return 'heart-pulse';
      case 'strength':
        return 'dumbbell';
      case 'flexibility':
        return 'meditation';
      case 'sports':
        return 'basketball';
      default:
        return 'run';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  const cardAccent = buildAccent(workout.type || '');
  const highlight = cardAccent.base ?? appColors.primaryBlue;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleStart} style={[styles.startButton, { backgroundColor: highlight }]}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.editButton, { borderColor: highlight }]}
          >
            <Ionicons name="create-outline" size={24} color={highlight} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.workoutHeaderCard,
            {
              borderColor: cardAccent.border,
              shadowColor: hexToRgba(cardAccent.base, 0.2),
            },
          ]}>
          <View
            style={[
              styles.workoutHeaderBackdrop,
              { backgroundColor: cardAccent.tint },
            ]}
          />
          <View style={styles.workoutHeaderContent}>
            <MaterialCommunityIcons
              name={getWorkoutTypeIcon(workout.type || 'cardio')}
              size={48}
              color={palette.textPrimary}
            />
            <Text style={styles.workoutName}>{workout.name || 'Unnamed Workout'}</Text>
            <Text style={styles.workoutDate}>
              {new Date(workout.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={highlight} />
            <Text style={styles.statValue}>{workout.totalDuration || 0}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={highlight} />
            <Text style={styles.statValue}>{workout.caloriesBurned || 0}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={highlight} />
            <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises && workout.exercises.length > 0 ? (
            workout.exercises.map((exercise: any, index: number) => (
              <View key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color={highlight} />
                  <Text style={styles.exerciseName}>{exercise.exercise?.name || 'Exercise'}</Text>
                </View>
                <View style={styles.exerciseStats}>
                  {exercise.sets > 0 && (
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Sets:</Text>
                      <Text style={styles.exerciseStatValue}>{exercise.sets}</Text>
                    </View>
                  )}
                  {exercise.reps > 0 && (
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Reps:</Text>
                      <Text style={styles.exerciseStatValue}>{exercise.reps}</Text>
                    </View>
                  )}
                  {exercise.weight > 0 && (
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Weight:</Text>
                      <Text style={styles.exerciseStatValue}>{exercise.weight} lbs</Text>
                    </View>
                  )}
                </View>
                {exercise.exercise?.targetMuscles && (
                  <Text style={[styles.exerciseTarget, { color: highlight }]}>
                    Target: {exercise.exercise.targetMuscles}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No exercises added to this workout</Text>
          )}
        </View>

        {workout.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{workout.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={palette.textPrimary} />
            <Text style={styles.deleteButtonText}>Delete Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={confirmDeleteVisible}
        title="Delete Workout"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 32,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: palette.accent,
    borderWidth: 0,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  workoutHeaderCard: {
    marginTop: 16,
    marginBottom: 18,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  workoutHeaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  workoutHeaderContent: {
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
    marginTop: 15,
    textAlign: 'center',
  },
  workoutDate: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseStatLabel: {
    fontSize: 14,
    color: palette.textSecondary,
    marginRight: 6,
  },
  exerciseStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  exerciseTarget: {
    fontSize: 12,
    marginTop: 4,
  },
  notesCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  notesText: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#F04438',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: palette.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: '#F87171',
  },
  noDataText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});

export default WorkoutDetail;
