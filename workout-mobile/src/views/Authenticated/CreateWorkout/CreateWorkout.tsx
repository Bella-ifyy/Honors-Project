import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { StackProps } from '@navigator';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '@utils/store';
import { setLoading, setExercises } from '@modules/workout/workout.slice';
import { workoutApi } from '@modules/workout/workout.api';
import { checkIsOnline } from '@utils/networkUtils';
import fitnessTheme from '@theme/fitness.theme';
import { colors as appColors } from '@theme/colors';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

const palette = {
  background: fitnessTheme.colors.background.primary,
  surface: fitnessTheme.colors.background.elevated,
  surfaceSoft: fitnessTheme.colors.background.tertiary,
  border: fitnessTheme.colors.border,
  textPrimary: fitnessTheme.colors.text.primary,
  textSecondary: fitnessTheme.colors.text.secondary,
  muted: 'rgba(255,255,255,0.55)',
  accent: appColors.primaryBlue,
  accentSoft: appColors.accentSky,
  error: '#F87171',
};


const CreateWorkout = ({ navigation, route }: StackProps<'CreateWorkoutStack'>) => {
  const dispatch = useDispatch();
  const exercises = useSelector((state: State) => state.workout.exercises);
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const presetAppliedRef = useRef(false);
  const editHydratedRef = useRef(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<'cardio' | 'strength' | 'flexibility' | 'sports'>('strength');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('12');
  const [customDuration, setCustomDuration] = useState('5');

  useEffect(() => {
    loadExercises();

    const { template, templateId, mode } = route.params ?? {};
    if (template) {
      hydrateWorkout(template, mode === 'edit' ? 'edit' : 'clone');
    } else if (templateId) {
      (async () => {
        try {
          const routine = await workoutApi.getRoutine(templateId);
          hydrateWorkout(routine, mode === 'edit' ? 'edit' : 'clone');
        } catch (error) {
          console.error('Error loading template:', error);
          toastError('Error', 'Unable to load template details.');
        }
      })();
    }
  }, [navigation, route.params]);

  const hydrateWorkout = (template: any, mode: 'edit' | 'clone') => {
    if (!template || editHydratedRef.current) {
      return;
    }

    setWorkoutName(template.name ?? '');
    setNotes(template.description ?? '');
    setDuration(template.estimatedDuration ? String(template.estimatedDuration) : '');
    setCalories(template.estimatedCalories ? String(template.estimatedCalories) : '');

    const mappedExercises = (template.exercises ?? []).map((item: any, index: number) => {
      const exerciseSource = item.exercise ?? {
        id: item.exerciseId ?? index,
        name: item.exercise?.name ?? item.name ?? 'Exercise',
        type: (item.exercise?.type ?? item.type ?? 'strength') as
          | 'cardio'
          | 'strength'
          | 'flexibility'
          | 'sports',
      };

      return {
        exerciseId: item.exerciseId ?? exerciseSource.id,
        exercise: exerciseSource,
        sets: item.targetSets ?? item.sets ?? 0,
        reps: item.targetReps ?? item.reps ?? 0,
        weight: item.targetWeight ?? item.weight ?? 0,
        duration: item.targetDuration ?? item.duration ?? 0,
        notes: item.notes ?? '',
        orderIndex: item.orderIndex ?? index,
      };
    });

    setSelectedExercises(mappedExercises);
    setIsEditMode(mode === 'edit');
    setEditingWorkoutId(mode === 'edit' ? template.id ?? null : null);
    presetAppliedRef.current = true;
    editHydratedRef.current = true;
  };

  const applyPresetTemplate = (presetKey: string) => {
    if (!presetKey || presetAppliedRef.current || isEditMode) {
      return;
    }

    const normalized = presetKey.toLowerCase();
    const presetConfigs: Record<
      string,
      {
        name: string;
        notes: string;
        duration: string;
        calories: string;
        type: 'cardio' | 'strength' | 'flexibility' | 'sports';
        count: number;
        interval?: number;
      }
    > = {
      cardio: {
        name: 'Quick Cardio Blast',
        notes: 'High-energy cardio intervals to spike your heart rate.',
        duration: '20',
        calories: '180',
        type: 'cardio',
        count: 2,
        interval: 10,
      },
      strength: {
        name: 'Strength Builder',
        notes: 'Compound lifts focused on total-body strength.',
        duration: '45',
        calories: '320',
        type: 'strength',
        count: 3,
      },
      mobility: {
        name: 'Mobility Reset',
        notes: 'Dynamic mobility flow to loosen up tight areas.',
        duration: '25',
        calories: '120',
        type: 'flexibility',
        count: 3,
        interval: 8,
      },
      flexibility: {
        name: 'Mobility Reset',
        notes: 'Dynamic mobility flow to loosen up tight areas.',
        duration: '25',
        calories: '120',
        type: 'flexibility',
        count: 3,
        interval: 8,
      },
      sports: {
        name: 'Athletic Conditioning',
        notes: 'Agility and conditioning drills inspired by sport training.',
        duration: '30',
        calories: '220',
        type: 'sports',
        count: 3,
      },
    };

    const config = presetConfigs[normalized];
    if (!config) {
      return;
    }

    if (!workoutName.trim()) {
      setWorkoutName(config.name);
    }
    if (!notes.trim()) {
      setNotes(config.notes);
    }
    if (!duration.trim()) {
      setDuration(config.duration);
    }
    if (!calories.trim()) {
      setCalories(config.calories);
    }

    let presetExercisesApplied = false;

    if (exercises.length) {
      const matchingExercises = exercises.filter(ex => ex.type === config.type);
      const chosen = matchingExercises.slice(0, config.count);
      if (chosen.length) {
        const presetExercises = chosen.map((exercise, index) => ({
          exerciseId: exercise.id,
          exercise,
          sets: config.type === 'cardio' || config.type === 'flexibility' ? 1 : 3,
          reps: config.type === 'cardio' || config.type === 'flexibility' ? 0 : 12,
          weight: 0,
          duration:
            config.type === 'cardio'
              ? (config.interval ?? 10)
              : config.type === 'flexibility'
                ? (config.interval ?? 8)
                : 0,
          notes: '',
          orderIndex: index,
        }));
        setSelectedExercises(presetExercises);
        presetExercisesApplied = true;
      }
    }

    if (presetExercisesApplied) {
      presetAppliedRef.current = true;
    }
  };

  useEffect(() => {
    const preset = route?.params?.preset as string | undefined;
    if (preset && exercises.length) {
      applyPresetTemplate(preset);
    }
  }, [route?.params?.preset, exercises]);

  const loadExercises = async () => {
    try {
      if (exercises.length === 0) {
        const exercisesData = await workoutApi.listExercises();
        dispatch(setExercises(exercisesData));
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const resetCustomFields = () => {
    setCustomName('');
    setCustomType('strength');
    setCustomSets('3');
    setCustomReps('12');
    setCustomDuration('5');
  };

  const addExercise = (exercise: any) => {
    const newExercise = {
      exerciseId: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: 10,
      weight: 0,
      duration: 0,
      notes: '',
      orderIndex: selectedExercises.length,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExercisePicker(false);
  };

  const addCustomExercise = () => {
    if (!customName.trim()) {
      toastInfo('Add a name', 'Give your move a name to add it to the program.');
      return;
    }

    const defaults =
      customType === 'cardio' || customType === 'flexibility'
        ? { sets: 1, reps: 0, duration: parseInt(customDuration, 10) || 5 }
        : { sets: parseInt(customSets, 10) || 3, reps: parseInt(customReps, 10) || 12, duration: 0 };

    const customExercise = {
      id: -Date.now(),
      name: customName.trim(),
      type: customType,
    };

    const newExercise = {
      exerciseId: customExercise.id,
      exercise: customExercise,
      sets: defaults.sets,
      reps: defaults.reps,
      weight: 0,
      duration: defaults.duration,
      notes: '',
      orderIndex: selectedExercises.length,
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    resetCustomFields();
    toastSuccess('Added', 'Custom move added to your plan.');
  };

  const updateExerciseDetail = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updated);
  };

  const ensureExerciseIds = async (exercisesToEnsure: any[]) => {
    const hasCustom = exercisesToEnsure.some(ex => !ex.exerciseId || ex.exerciseId < 0);
    if (hasCustom) {
      const online = await checkIsOnline();
      if (!online) {
        toastInfo('Go online to save', 'Custom moves need a quick sync to save this template.');
        return null;
      }
    }

    const hydrated: any[] = [];

    for (const ex of exercisesToEnsure) {
      let exerciseId = ex.exerciseId ?? ex.exercise?.id;
      let exerciseMeta = ex.exercise;

      if (!exerciseId || exerciseId < 0) {
        try {
          const created = await workoutApi.createExercise({
            name: ex.exercise?.name ?? 'Custom Exercise',
            type: ex.exercise?.type ?? 'strength',
            description: ex.notes ?? '',
            mediaUrl: null,
          });
          exerciseId = created?.id ?? exerciseId;
          exerciseMeta = created ? { ...created } : exerciseMeta;
        } catch (error) {
          console.error('Error creating custom exercise:', error);
          toastError('Save failed', 'Unable to save your custom moves right now.');
          return null;
        }
      }

      hydrated.push({
        ...ex,
        exerciseId,
        exercise: exerciseMeta,
      });
    }

    return hydrated;
  };

  const saveTemplate = async () => {
    if (!workoutName.trim()) {
      toastInfo('Add a workout name', 'Please enter a template name.');
      return;
    }

    if (selectedExercises.length === 0) {
      toastInfo('Add an exercise', 'Please add at least one exercise.');
      return;
    }

    const hydratedExercises = await ensureExerciseIds(selectedExercises);
    if (!hydratedExercises) {
      return;
    }

    const routineExercises = hydratedExercises
      .map((e, index) => {
        const exerciseId = e.exerciseId ?? e.exercise?.id;
        if (!exerciseId) {
          return null;
        }
        return {
          exerciseId,
          targetSets: e.sets ?? 0,
          targetReps: e.reps ?? 0,
          targetWeight: e.weight ?? 0,
          targetDuration: (e.duration ?? 0),
          restTime: e.restTime ?? 0,
          orderIndex: index,
        };
      })
      .filter(Boolean);

    if (routineExercises.length === 0) {
      toastInfo('Add an exercise', 'Please add at least one exercise.');
      return;
    }

    setSaving(true);

    const routineData = {
      name: workoutName.trim(),
      description: notes,
      estimatedDuration: parseInt(duration) || undefined,
      estimatedCalories: parseInt(calories) || undefined,
      scheduledDays: [],
      isActive: true,
      exercises: routineExercises,
    };

    try {
      const isOnline = await checkIsOnline();

      if (isEditMode && editingWorkoutId) {
        if (!isOnline) {
          toastInfo('Offline', 'Reconnect to update this template.');
          return;
        }
        await workoutApi.updateRoutine(editingWorkoutId, routineData);
        toastSuccess('Template updated', 'We saved your workout template.');
      } else if (isOnline) {
        await workoutApi.createRoutine(routineData);
        toastSuccess('Template saved', 'Your workout template is ready.');
      } else {
        toastInfo('Offline', 'Reconnect to create templates.');
        return;
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving template:', error);
      toastError('Error', 'Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = isEditMode ? 'Edit Template' : 'New Template';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <TouchableOpacity onPress={saveTemplate} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Ionicons name="checkmark" size={28} color={palette.accent} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Template Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Morning Cardio"
            placeholderTextColor={palette.muted}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        <View style={styles.rowSection}>
          <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor={palette.muted}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="250"
              placeholderTextColor={palette.muted}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes about this workout..."
            placeholderTextColor={palette.muted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Exercises *</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowExercisePicker(true)}>
              <Ionicons name="add-circle" size={24} color={palette.accent} />
            </TouchableOpacity>
          </View>

          {selectedExercises.map((ex, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                <TouchableOpacity onPress={() => removeExercise(index)}>
                  <Ionicons name="close-circle" size={20} color={palette.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.exerciseDetails}>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Sets</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={ex.sets?.toString()}
                    onChangeText={val => updateExerciseDetail(index, 'sets', parseInt(val) || 0)}
                  />
                </View>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Reps</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={ex.reps?.toString()}
                    onChangeText={val => updateExerciseDetail(index, 'reps', parseInt(val) || 0)}
                  />
                </View>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={ex.weight?.toString()}
                    onChangeText={val =>
                      updateExerciseDetail(index, 'weight', parseFloat(val) || 0)
                    }
                  />
                </View>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Duration (min)</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={(ex.duration ?? 0).toString()}
                    onChangeText={val =>
                      updateExerciseDetail(index, 'duration', parseInt(val, 10) || 0)
                    }
                  />
                </View>
              </View>
            </View>
          ))}

          {selectedExercises.length === 0 && (
            <Text style={styles.emptyText}>No exercises added yet</Text>
          )}
        </View>
      </ScrollView>

      {showExercisePicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                <Ionicons name="close" size={28} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.customBuilder}>
              <Text style={styles.modalSubtitle}>Build your own move</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Dumbbell Woodchopper"
                placeholderTextColor={palette.muted}
                value={customName}
                onChangeText={setCustomName}
              />
              <View style={styles.typeChipRow}>
                {(['strength', 'cardio', 'flexibility', 'sports'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      customType === type && styles.typeChipActive,
                    ]}
                    onPress={() => setCustomType(type)}>
                    <Text
                      style={[
                        styles.typeChipText,
                        customType === type && styles.typeChipTextActive,
                      ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.exerciseDetails}>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Sets</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={customSets}
                    onChangeText={setCustomSets}
                  />
                </View>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Reps</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={customReps}
                    onChangeText={setCustomReps}
                  />
                </View>
                <View style={styles.exerciseInput}>
                  <Text style={styles.exerciseLabel}>Duration (min)</Text>
                  <TextInput
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={customDuration}
                    onChangeText={setCustomDuration}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={addCustomExercise}>
                <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Add to workout</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Custom moves use your saved videos automatically. Sets/reps are used for strength, duration for cardio or mobility.
              </Text>
            </View>
            <ScrollView style={styles.exerciseList}>
              {exercises.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseOption}
                  onPress={() => addExercise(exercise)}>
                  <View>
                    <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                    <Text style={styles.exerciseOptionType}>{exercise.type}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color={palette.accent} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateWorkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 36 : 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 18,
  },
  rowSection: {
    flexDirection: 'row',
    marginBottom: 18,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  smallInput: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
    textAlign: 'center',
    width: 70,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  exerciseCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  exerciseInput: {
    alignItems: 'center',
  },
  exerciseLabel: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: palette.muted,
    fontSize: 14,
    paddingVertical: 18,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: palette.border,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  exerciseList: {
    padding: 24,
  },
  customBuilder: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  typeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
  },
  typeChipActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  typeChipText: {
    color: palette.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeChipTextActive: {
    color: palette.textPrimary,
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: palette.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  exerciseOptionType: {
    fontSize: 13,
    color: palette.muted,
    textTransform: 'capitalize',
  },
  primaryButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.accent,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 4,
  },
});
