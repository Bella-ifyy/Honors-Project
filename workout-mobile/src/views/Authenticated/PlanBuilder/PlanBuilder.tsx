import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackProps } from '@navigator';
import { colors } from '@theme/colors';
import { workoutCatalog, CatalogTemplate } from '../../../data/workoutCatalog';
import { workoutApi } from '@modules/workout/workout.api';
import { toastError, toastSuccess } from '@utils/toast';

const equipmentOptions = ['bodyweight', 'dumbbell', 'band', 'barbell', 'machine', 'cable', 'any'] as const;
const goalOptions = ['strength', 'hypertrophy', 'fat-loss', 'mobility'] as const;
const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'] as const;
const durationOptions = [15, 20, 25, 30, 40, 45, 60];

const PlanBuilder = ({ navigation }: StackProps<'PlanBuilderStack'>) => {
  const [equipment, setEquipment] = useState<(typeof equipmentOptions)[number]>('any');
  const [goal, setGoal] = useState<(typeof goalOptions)[number]>('strength');
  const [difficulty, setDifficulty] = useState<(typeof difficultyOptions)[number]>('Intermediate');
  const [duration, setDuration] = useState<number>(30);
  const [saving, setSaving] = useState(false);

  const suggestion = useMemo(() => {
    const scored = workoutCatalog
      .map((template: CatalogTemplate) => {
        let score = 0;
        if (template.goal === goal) score += 3;
        if (template.difficulty === difficulty) score += 2;
        if (template.duration <= duration + 10 && template.duration >= duration - 10) score += 2;
        if (equipment === 'any' || template.equipment.includes(equipment)) score += 2;
        return { template, score };
      })
      .sort((a: { template: CatalogTemplate; score: number }, b: { template: CatalogTemplate; score: number }) => b.score - a.score);
    return scored[0]?.template ?? workoutCatalog[0];
  }, [equipment, goal, difficulty, duration]);

  const savePlan = async () => {
    if (!suggestion) return;
    setSaving(true);
    try {
      const payload = {
        name: `${suggestion.name} (My Plan)`,
        description: suggestion.description,
        difficulty: suggestion.difficulty,
        estimatedDuration: suggestion.duration,
        estimatedCalories: suggestion.goal === 'fat-loss' ? 300 : 200,
        isPreDefined: false,
        exercises: [], // backend will allow empty; user can edit later
      };
      await workoutApi.createRoutine(payload);
      toastSuccess('Plan saved', 'Find it in your workouts');
      navigation.navigate('WorkoutTrackerStack' as never);
    } catch (error) {
      console.error('Plan builder save error', error);
      toastError('Error', 'Could not save plan');
    } finally {
      setSaving(false);
    }
  };

  const PillRow = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (v: any) => void;
  }) => (
    <View style={styles.pillRow}>
      {options.map(opt => {
        const isActive = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(opt)}>
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!suggestion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build a plan</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Goal</Text>
        <PillRow options={goalOptions as unknown as string[]} value={goal} onChange={setGoal} />

        <Text style={styles.label}>Equipment</Text>
        <PillRow
          options={equipmentOptions as unknown as string[]}
          value={equipment}
          onChange={setEquipment}
        />

        <Text style={styles.label}>Difficulty</Text>
        <PillRow
          options={difficultyOptions as unknown as string[]}
          value={difficulty}
          onChange={setDifficulty}
        />

        <Text style={styles.label}>Duration (min)</Text>
        <PillRow
          options={durationOptions.map(String)}
          value={String(duration)}
          onChange={(v: string) => setDuration(Number(v))}
        />

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Suggested plan</Text>
          <Text style={styles.cardTitle}>{suggestion.name}</Text>
          <Text style={styles.cardSubtitle}>{suggestion.description}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="flame-outline" size={14} color={colors.primaryBlue} />
              <Text style={styles.badgeText}>{suggestion.goal}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={14} color={colors.primaryBlue} />
              <Text style={styles.badgeText}>{suggestion.duration} min</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="barbell-outline" size={14} color={colors.primaryBlue} />
              <Text style={styles.badgeText}>{suggestion.difficulty}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveBtn} onPress={savePlan} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="save-outline" size={18} color={colors.white} />
            <Text style={styles.saveText}>Save plan</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#E8F0FF',
  },
  pillText: { color: colors.textPrimary, fontWeight: '600' },
  pillTextActive: { color: colors.primaryBlue },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardEyebrow: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  cardSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
  },
  badgeText: { color: colors.primaryBlue, fontWeight: '700' },
  saveBtn: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default PlanBuilder;
