import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackProps } from '@navigator';
import { workoutApi } from '@modules/workout/workout.api';
import { colors } from '@theme/colors';
import { toastError, toastSuccess } from '@utils/toast';
const equipmentOptions = ['bodyweight', 'dumbbell', 'band', 'barbell', 'machine', 'cable', 'any'];
const goalOptions = ['strength', 'hypertrophy', 'fat-loss', 'mobility'];

type Exercise = {
  id: number;
  name: string;
  description?: string;
  mediaUrl?: string;
  equipment?: string;
  targetMuscles?: string;
};

const ExerciseLibrary = ({ navigation }: StackProps<'ExerciseLibraryStack'>) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [all, favs] = await Promise.all([
        workoutApi.listExercises(),
        workoutApi.listFavoriteExercises(),
      ]);
      setExercises(all || []);
      setFavorites((favs || []).map((f: Exercise) => f.id));
    } catch (error) {
      console.error('Failed to load exercises', error);
      toastError('Error', 'Unable to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter(ex => {
      const nameMatch = !term || ex.name.toLowerCase().includes(term);
      const equip = (ex.equipment || 'all').toLowerCase();
      const goal = (ex.targetMuscles || '').toLowerCase();
      const diff = 'intermediate'; // default
      const eqOk = equipmentFilter === 'all' || equip.includes(equipmentFilter);
      const goalOk = goalFilter === 'all' || goal.includes(goalFilter);
      const diffOk = difficultyFilter === 'all' || diff.includes(difficultyFilter);
      return nameMatch && eqOk && goalOk && diffOk;
    });
  }, [exercises, search, equipmentFilter, goalFilter, difficultyFilter]);

  const toggleFavorite = async (exerciseId: number) => {
    try {
      const res = await workoutApi.toggleExerciseFavorite(exerciseId);
      setFavorites(prev => {
        if (res?.isFavorite) return Array.from(new Set([...prev, exerciseId]));
        return prev.filter(id => id !== exerciseId);
      });
    } catch (error) {
      console.error('Fav error', error);
      toastError('Error', 'Could not update favorite');
    }
  };

  const toggleSelected = (exerciseId: number) => {
    setSelected(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId],
    );
  };

  const savePlan = async () => {
    if (!selected.length) {
      toastError('Select exercises first');
      return;
    }
    setSavingPlan(true);
    try {
      const routinePayload = {
        name: 'Custom Plan',
        description: 'Created from library',
        exercises: selected.map((id, idx) => ({
          exerciseId: id,
          targetSets: 3,
          targetReps: 12,
          restTime: 60,
          orderIndex: idx,
        })),
      };
      await workoutApi.createRoutine(routinePayload);
      toastSuccess('Plan saved', 'Find it in your workouts');
      setSelected([]);
    } catch (error) {
      console.error('Save plan error', error);
      toastError('Error', 'Could not save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const renderItem = ({ item }: { item: Exercise }) => {
    const isFav = favorites.includes(item.id);
    const isPicked = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, isPicked && styles.cardSelected]}
        onPress={() => toggleSelected(item.id)}
        activeOpacity={0.9}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? colors.primaryBlue : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.meta}>{item.equipment ?? 'bodyweight'}</Text>
        <Text style={styles.meta}>{item.targetMuscles ?? 'full body'}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          placeholder="Search exercises"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['all', ...equipmentOptions].map(opt => (
            <TouchableOpacity
              key={`eq-${opt}`}
              style={[styles.filterPill, equipmentFilter === opt && styles.filterPillActive]}
              onPress={() => setEquipmentFilter(opt)}>
              <Text style={[styles.filterText, equipmentFilter === opt && styles.filterTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
          {['all', ...goalOptions].map(opt => (
            <TouchableOpacity
              key={`goal-${opt}`}
              style={[styles.filterPill, goalFilter === opt && styles.filterPillActive]}
              onPress={() => setGoalFilter(opt)}>
              <Text style={[styles.filterText, goalFilter === opt && styles.filterTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{selected.length} selected</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={savePlan} disabled={savingPlan}>
          {savingPlan ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={colors.white} />
              <Text style={styles.saveText}>Save as plan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  searchRow: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.textPrimary },
  filterRow: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#E8F0FF',
  },
  filterText: { color: colors.textPrimary, fontWeight: '600' },
  filterTextActive: { color: colors.primaryBlue },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#E8F0FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerText: { color: colors.textPrimary, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveText: { color: colors.white, fontWeight: '700' },
});

export default ExerciseLibrary;
