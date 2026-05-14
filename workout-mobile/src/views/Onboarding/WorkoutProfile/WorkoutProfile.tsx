import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackProps } from '@navigator';
import TyText from '@components/TyText/TyText';
import { colors as appColors } from '@theme/colors';
import { fitnessTheme } from '@theme/fitness.theme';
import { workoutApi } from '@modules/workout/workout.api';
import { useAppSlice } from '@modules/app';
import { getAuthData, updateAuthDataField } from '@utils/store/authStore';
import { toastError, toastSuccess } from '@utils/toast';

const workoutTypes = ['Strength', 'Cardio', 'Flexibility', 'Sports', 'Mobility', 'HIIT', 'Pilates', 'Yoga'];
const equipmentOptions = ['Bodyweight', 'Dumbbells', 'Bands', 'Kettlebell', 'Barbell', 'Machines', 'Cable'];
const targetAreas = ['Full Body', 'Upper', 'Lower', 'Core', 'Glutes', 'Back', 'Shoulders', 'Arms'];
const goalOptions = ['Build strength', 'Lose fat', 'Improve endurance', 'Tone up', 'Mobility'];
const activityOptions = ['Sedentary', 'Lightly active', 'Active', 'Very active'];
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const stressOptions = ['Low', 'Moderate', 'High'];
const nutritionOptions = ['Balanced', 'High protein', 'Low carb', 'Plant focused', 'Performance'];
const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

const WorkoutProfileOnboarding = ({ navigation }: StackProps<'WorkoutOnboardingStack'>) => {
  const { dispatch, user, setUser } = useAppSlice();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    units: 'metric',
    activityLevel: '',
    experienceLevel: '',
    primaryGoal: '',
    weeklyWorkouts: '',
    sessionDurationMinutes: '',
    workoutTypes: [] as string[],
    targetAreas: [] as string[],
    equipmentAccess: [] as string[],
    injuries: '',
    medicalConditions: '',
    sleepHours: '',
    stressLevel: '',
    nutritionFocus: '',
    hydrationLiters: '',
    restingHeartRate: '',
    stepGoal: '',
  });

  const updateField = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleListValue = (key: 'workoutTypes' | 'targetAreas' | 'equipmentAccess', value: string) => {
    setForm(prev => {
      const list = prev[key];
      const next = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const toNumber = (value: string) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const totalSteps = 5;

  const canProceed = useMemo(() => {
    if (stepIndex === 0) {
      return !!form.age && !!form.gender && !!form.height && !!form.weight;
    }
    if (stepIndex === 1) {
      return (
        !!form.primaryGoal &&
        !!form.activityLevel &&
        !!form.experienceLevel &&
        !!form.weeklyWorkouts &&
        !!form.sessionDurationMinutes
      );
    }
    if (stepIndex === 2) {
      return !!form.sleepHours && !!form.stressLevel;
    }
    if (stepIndex === 3) {
      return form.workoutTypes.length > 0 && form.equipmentAccess.length > 0;
    }
    return true;
  }, [form, stepIndex]);

  const progress = (stepIndex + 1) / totalSteps;

  const handleBack = () => {
    if (stepIndex === 0) {
      return;
    }
    setStepIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(prev => prev + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const heightValue = toNumber(form.height) ?? 0;
      const weightValue = toNumber(form.weight) ?? 0;
      const heightCm = form.units === 'imperial' ? heightValue * 2.54 : heightValue;
      const weightKg = form.units === 'imperial' ? weightValue * 0.453592 : weightValue;

      const payload = {
        age: toNumber(form.age),
        gender: form.gender,
        heightCm,
        weightKg,
        activityLevel: form.activityLevel,
        experienceLevel: form.experienceLevel,
        primaryGoal: form.primaryGoal,
        weeklyWorkouts: toNumber(form.weeklyWorkouts),
        sessionDurationMinutes: toNumber(form.sessionDurationMinutes),
        workoutTypes: form.workoutTypes,
        targetAreas: form.targetAreas,
        equipmentAccess: form.equipmentAccess,
        injuries: form.injuries,
        medicalConditions: form.medicalConditions,
        sleepHours: toNumber(form.sleepHours),
        stressLevel: form.stressLevel,
        nutritionFocus: form.nutritionFocus,
        hydrationLiters: toNumber(form.hydrationLiters),
        restingHeartRate: toNumber(form.restingHeartRate),
        stepGoal: toNumber(form.stepGoal),
        units: form.units,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await workoutApi.saveWorkoutProfile(payload);
      await updateAuthDataField('workoutOnboardingCompleted', true);
      const stored = await getAuthData();
      const nextUser = { ...(stored || user || {}), workoutOnboardingCompleted: true };
      dispatch(setUser(nextUser));
      toastSuccess('Profile saved', 'Your training plan is ready.');
      navigation.reset({ index: 0, routes: [{ name: 'WorkoutTrackerStack' as never }] });
    } catch (error) {
      console.error('Workout onboarding save failed', error);
      toastError('Error', 'We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderStepHeader = (title: string, subtitle: string) => (
    <View style={styles.headerBlock}>
      <TyText weight="bold" style={styles.headerTitle}>{title}</TyText>
      <TyText style={styles.headerSubtitle}>{subtitle}</TyText>
    </View>
  );

  const renderPills = (
    options: string[],
    selected: string | string[],
    onSelect: (value: string) => void,
    multi = false,
  ) => (
    <View style={styles.pillRow}>
      {options.map(option => {
        const active = Array.isArray(selected) ? selected.includes(option) : selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.pill, active && styles.pillActive]}>
            <TyText style={[styles.pillText, active && styles.pillTextActive]}>{option}</TyText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const steps = [
    {
      title: 'Baseline stats',
      subtitle: 'Dial in your body metrics and units',
      content: (
        <>
          {renderStepHeader('Baseline stats', 'Dial in your body metrics and units')}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.field}>
                <TyText style={styles.label}>Age</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="24"
                  placeholderTextColor={appColors.textMuted}
                  value={form.age}
                  onChangeText={value => updateField('age', value)}
                />
              </View>
              <View style={styles.field}>
                <TyText style={styles.label}>Gender</TyText>
                {renderPills(genderOptions, form.gender, value => updateField('gender', value))}
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <TyText style={styles.label}>Height ({form.units === 'imperial' ? 'in' : 'cm'})</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder={form.units === 'imperial' ? '68' : '172'}
                  placeholderTextColor={appColors.textMuted}
                  value={form.height}
                  onChangeText={value => updateField('height', value)}
                />
              </View>
              <View style={styles.field}>
                <TyText style={styles.label}>Weight ({form.units === 'imperial' ? 'lb' : 'kg'})</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder={form.units === 'imperial' ? '160' : '72'}
                  placeholderTextColor={appColors.textMuted}
                  value={form.weight}
                  onChangeText={value => updateField('weight', value)}
                />
              </View>
            </View>
            <View style={styles.field}>
              <TyText style={styles.label}>Units</TyText>
              {renderPills(['metric', 'imperial'], form.units, value => updateField('units', value))}
            </View>
          </View>
        </>
      ),
    },
    {
      title: 'Goals & routine',
      subtitle: 'Shape your training direction',
      content: (
        <>
          {renderStepHeader('Goals & routine', 'Shape your training direction')}
          <View style={styles.card}>
            <TyText style={styles.label}>Primary goal</TyText>
            {renderPills(goalOptions, form.primaryGoal, value => updateField('primaryGoal', value))}
            <TyText style={styles.label}>Activity level</TyText>
            {renderPills(activityOptions, form.activityLevel, value => updateField('activityLevel', value))}
            <TyText style={styles.label}>Training experience</TyText>
            {renderPills(experienceOptions, form.experienceLevel, value => updateField('experienceLevel', value))}
            <View style={styles.row}>
              <View style={styles.field}>
                <TyText style={styles.label}>Workouts per week</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="4"
                  placeholderTextColor={appColors.textMuted}
                  value={form.weeklyWorkouts}
                  onChangeText={value => updateField('weeklyWorkouts', value)}
                />
              </View>
              <View style={styles.field}>
                <TyText style={styles.label}>Session length (min)</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="45"
                  placeholderTextColor={appColors.textMuted}
                  value={form.sessionDurationMinutes}
                  onChangeText={value => updateField('sessionDurationMinutes', value)}
                />
              </View>
            </View>
          </View>
        </>
      ),
    },
    {
      title: 'Recovery & health',
      subtitle: 'Help us stay aligned with your body',
      content: (
        <>
          {renderStepHeader('Recovery & health', 'Help us stay aligned with your body')}
          <View style={styles.card}>
            <TyText style={styles.label}>Sleep hours</TyText>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="7.5"
              placeholderTextColor={appColors.textMuted}
              value={form.sleepHours}
              onChangeText={value => updateField('sleepHours', value)}
            />
            <TyText style={styles.label}>Stress level</TyText>
            {renderPills(stressOptions, form.stressLevel, value => updateField('stressLevel', value))}
            <TyText style={styles.label}>Resting heart rate</TyText>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="62"
              placeholderTextColor={appColors.textMuted}
              value={form.restingHeartRate}
              onChangeText={value => updateField('restingHeartRate', value)}
            />
            <TyText style={styles.label}>Injuries to consider</TyText>
            <TextInput
              style={[styles.input, styles.inputArea]}
              placeholder="e.g. knee discomfort"
              placeholderTextColor={appColors.textMuted}
              value={form.injuries}
              onChangeText={value => updateField('injuries', value)}
              multiline
            />
            <TyText style={styles.label}>Medical conditions</TyText>
            <TextInput
              style={[styles.input, styles.inputArea]}
              placeholder="Optional"
              placeholderTextColor={appColors.textMuted}
              value={form.medicalConditions}
              onChangeText={value => updateField('medicalConditions', value)}
              multiline
            />
          </View>
        </>
      ),
    },
    {
      title: 'Preferences',
      subtitle: 'Choose your favorite training style',
      content: (
        <>
          {renderStepHeader('Preferences', 'Choose your favorite training style')}
          <View style={styles.card}>
            <TyText style={styles.label}>Workout types</TyText>
            {renderPills(workoutTypes, form.workoutTypes, value => toggleListValue('workoutTypes', value), true)}
            <TyText style={styles.label}>Equipment access</TyText>
            {renderPills(equipmentOptions, form.equipmentAccess, value => toggleListValue('equipmentAccess', value), true)}
            <TyText style={styles.label}>Target areas</TyText>
            {renderPills(targetAreas, form.targetAreas, value => toggleListValue('targetAreas', value), true)}
            <TyText style={styles.label}>Nutrition focus</TyText>
            {renderPills(nutritionOptions, form.nutritionFocus, value => updateField('nutritionFocus', value))}
            <View style={styles.row}>
              <View style={styles.field}>
                <TyText style={styles.label}>Water per day (L)</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="2.5"
                  placeholderTextColor={appColors.textMuted}
                  value={form.hydrationLiters}
                  onChangeText={value => updateField('hydrationLiters', value)}
                />
              </View>
              <View style={styles.field}>
                <TyText style={styles.label}>Daily step goal</TyText>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="8000"
                  placeholderTextColor={appColors.textMuted}
                  value={form.stepGoal}
                  onChangeText={value => updateField('stepGoal', value)}
                />
              </View>
            </View>
          </View>
        </>
      ),
    },
    {
      title: 'Review & finish',
      subtitle: 'Confirm your setup',
      content: (
        <>
          {renderStepHeader('Review & finish', 'Confirm your setup')}
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Goal</TyText>
              <TyText style={styles.summaryValue}>{form.primaryGoal || '-'}</TyText>
            </View>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Weekly workouts</TyText>
              <TyText style={styles.summaryValue}>{form.weeklyWorkouts || '-'}</TyText>
            </View>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Session length</TyText>
              <TyText style={styles.summaryValue}>{form.sessionDurationMinutes || '-'} min</TyText>
            </View>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Workout types</TyText>
              <TyText style={styles.summaryValue}>
                {form.workoutTypes.length ? form.workoutTypes.join(', ') : '-'}
              </TyText>
            </View>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Equipment</TyText>
              <TyText style={styles.summaryValue}>
                {form.equipmentAccess.length ? form.equipmentAccess.join(', ') : '-'}
              </TyText>
            </View>
            <View style={styles.summaryRow}>
              <TyText style={styles.summaryLabel}>Sleep hours</TyText>
              <TyText style={styles.summaryValue}>{form.sleepHours || '-'}</TyText>
            </View>
          </View>
        </>
      ),
    },
  ];

  return (
    <LinearGradient colors={['#F7F5FF', '#EEF4FF']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <TyText style={styles.stepCounter}>{stepIndex + 1} / {totalSteps}</TyText>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <TyText weight="bold" style={styles.heroTitle}>Build your training profile</TyText>
            <TyText style={styles.heroSubtitle}>
              We use this to personalize workouts, reminders, and recovery guidance.
            </TyText>
          </View>
          {steps[stepIndex].content}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.secondaryButton, stepIndex === 0 && styles.disabledButton]} onPress={handleBack} disabled={stepIndex === 0}>
            <TyText style={styles.secondaryButtonText}>Back</TyText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, !canProceed && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canProceed || saving}>
            {saving ? (
              <ActivityIndicator color={appColors.white} />
            ) : (
              <TyText style={styles.primaryButtonText}>
                {stepIndex === totalSteps - 1 ? 'Finish' : 'Continue'}
              </TyText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(116, 82, 255, 0.15)',
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: appColors.primaryBlue,
  },
  stepCounter: {
    fontSize: 12,
    color: appColors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  heroCard: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appColors.border,
    shadowColor: '#CBD4FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 20,
    color: appColors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: appColors.textSecondary,
  },
  headerBlock: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: appColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: appColors.textSecondary,
  },
  card: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: appColors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    backgroundColor: appColors.surfaceMuted,
    color: appColors.textPrimary,
    marginBottom: 12,
  },
  inputArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surfaceMuted,
  },
  pillActive: {
    borderColor: appColors.primaryBlue,
    backgroundColor: fitnessTheme.colors.workout.mixed.gradient[0],
  },
  pillText: {
    fontSize: 12,
    color: appColors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: appColors.primaryBlue,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: appColors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: appColors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: appColors.border,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: appColors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default WorkoutProfileOnboarding;
