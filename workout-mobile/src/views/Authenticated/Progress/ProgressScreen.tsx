import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  DiaryEntry,
  DiaryMood,
  UpsertDiaryPayload,
  workoutApi,
} from '@modules/workout/workout.api';
import fitnessTheme from '@theme/fitness.theme';
import { toastError, toastSuccess } from '@utils/toast';

interface ProgressData {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  weeklyGoal: number;
  weeklyWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  favoriteWorkout: string;
  improvementAreas: string[];
}

type JournalDraft = {
  title: string;
  content: string;
  mood: DiaryMood;
  tags: string;
};

const journalMoods: DiaryMood[] = ['reflective', 'grateful', 'energized', 'calm', 'melancholy'];

const emptyJournalDraft: JournalDraft = {
  title: '',
  content: '',
  mood: 'reflective',
  tags: '',
};

const palette = {
  background: fitnessTheme.colors.background.primary,
  surface: fitnessTheme.colors.background.elevated,
  surfaceSoft: fitnessTheme.colors.background.tertiary,
  border: fitnessTheme.colors.border,
  textPrimary: fitnessTheme.colors.text.primary,
  textSecondary: fitnessTheme.colors.text.secondary,
  muted: fitnessTheme.colors.text.tertiary,
  accent: fitnessTheme.colors.primary,
  accentSoft: fitnessTheme.colors.accent,
  success: fitnessTheme.colors.success,
  warning: fitnessTheme.colors.warning,
  danger: fitnessTheme.colors.error,
  subtleFill: fitnessTheme.colors.border,
  mutedFill: fitnessTheme.colors.borderLight,
};

const journalMoodMeta: Record<
  DiaryMood,
  {
    label: string;
    accent: string;
    background: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  reflective: {
    label: 'Reflective',
    accent: '#6A5AE0',
    background: '#F1EEFF',
    icon: 'moon-outline',
  },
  grateful: {
    label: 'Grateful',
    accent: '#E28A1B',
    background: '#FFF2DE',
    icon: 'sunny-outline',
  },
  energized: {
    label: 'Energized',
    accent: '#FF6B6B',
    background: '#FFE8E8',
    icon: 'flash-outline',
  },
  calm: {
    label: 'Calm',
    accent: '#0E9F8B',
    background: '#E5FBF6',
    icon: 'leaf-outline',
  },
  melancholy: {
    label: 'Melancholy',
    accent: '#5B6A8C',
    background: '#EEF1F8',
    icon: 'cloud-outline',
  },
};

const sortEntriesByUpdatedAt = (entries: DiaryEntry[]) =>
  [...entries].sort((left, right) => {
    const leftTime = new Date(left.updatedAt ?? left.createdAt).getTime();
    const rightTime = new Date(right.updatedAt ?? right.createdAt).getTime();
    return rightTime - leftTime;
  });

const parseTags = (value: string): string[] =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

const formatEntryDate = (value?: string) => {
  if (!value) {
    return 'Recently updated';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently updated';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const ProgressScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [savingJournal, setSavingJournal] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<number | null>(null);
  const [journalEntries, setJournalEntries] = useState<DiaryEntry[]>([]);
  const [journalDraft, setJournalDraft] = useState<JournalDraft>(emptyJournalDraft);
  const [progressData, setProgressData] = useState<ProgressData>({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    weeklyGoal: 5,
    weeklyWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteWorkout: 'None',
    improvementAreas: [],
  });

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', workouts: 0, calories: 0 },
    { day: 'Tue', workouts: 0, calories: 0 },
    { day: 'Wed', workouts: 0, calories: 0 },
    { day: 'Thu', workouts: 0, calories: 0 },
    { day: 'Fri', workouts: 0, calories: 0 },
    { day: 'Sat', workouts: 0, calories: 0 },
    { day: 'Sun', workouts: 0, calories: 0 },
  ]);

  const [monthlyStats, setMonthlyStats] = useState([
    { month: 'Jan', workouts: 0, calories: 0 },
    { month: 'Feb', workouts: 0, calories: 0 },
    { month: 'Mar', workouts: 0, calories: 0 },
    { month: 'Apr', workouts: 0, calories: 0 },
  ]);

  useEffect(() => {
    void fetchProgressData();
  }, []);

  const activeJournalEntry = useMemo(
    () => journalEntries.find(entry => entry.id === editingJournalId) ?? null,
    [editingJournalId, journalEntries],
  );

  const journalPrompt = useMemo(() => {
    const focus = progressData.improvementAreas.length
      ? progressData.improvementAreas.join(', ')
      : 'consistency, recovery, and next-step planning';

    return `Capture how training felt, what changed this week, and what to focus on next. Current streak: ${progressData.currentStreak}. Focus areas: ${focus}.`;
  }, [progressData.currentStreak, progressData.improvementAreas]);

  const fetchProgressData = async () => {
    try {
      const [metrics, summary, entries] = await Promise.all([
        workoutApi.getProgressMetrics(),
        workoutApi.getDashboardSummary(),
        workoutApi.listDiaryEntries(),
      ]);

      const currentWeekWorkouts = Array.isArray(metrics.weeklyData)
        ? metrics.weeklyData.reduce(
            (total: number, day: { workouts?: number }) => total + Number(day.workouts || 0),
            0,
          )
        : summary.weeklyWorkouts || 0;

      setProgressData({
        totalWorkouts: summary.totalWorkouts || 0,
        totalCalories: summary.totalCaloriesBurned || 0,
        totalDuration: summary.totalDuration || 0,
        weeklyGoal: 5,
        weeklyWorkouts: currentWeekWorkouts,
        currentStreak: summary.currentStreak || 0,
        longestStreak: summary.longestStreak || 0,
        favoriteWorkout: summary.favoriteWorkout || 'None',
        improvementAreas: summary.improvementAreas || [],
      });

      if (metrics.weeklyData) {
        setWeeklyProgress(metrics.weeklyData);
      }
      if (metrics.monthlyData) {
        setMonthlyStats(metrics.monthlyData);
      }

      setJournalEntries(sortEntriesByUpdatedAt(entries || []));
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoadingScreen(false);
      setLoadingJournal(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return palette.success;
    if (streak >= 3) return palette.warning;
    return palette.danger;
  };

  const getProgressPercentage = () => {
    return Math.min((progressData.weeklyWorkouts / progressData.weeklyGoal) * 100, 100);
  };

  const resetJournalEditor = () => {
    setShowJournalEditor(false);
    setEditingJournalId(null);
    setJournalDraft(emptyJournalDraft);
  };

  const openNewJournalEditor = () => {
    const todayLabel = new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setEditingJournalId(null);
    setJournalDraft({
      title: `Progress report - ${todayLabel}`,
      content: '',
      mood: 'reflective',
      tags: progressData.improvementAreas.slice(0, 2).join(', '),
    });
    setShowJournalEditor(true);
  };

  const openEditJournalEditor = (entry: DiaryEntry) => {
    setEditingJournalId(entry.id);
    setJournalDraft({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: (entry.tags || []).join(', '),
    });
    setShowJournalEditor(true);
  };

  const handleSaveJournal = async () => {
    if (!journalDraft.title.trim() && !journalDraft.content.trim()) {
      toastError('Add some detail', 'Write a title or a short report before saving.');
      return;
    }

    setSavingJournal(true);

    const payload: UpsertDiaryPayload = {
      title: journalDraft.title.trim() || 'Untitled progress report',
      content: journalDraft.content.trim(),
      mood: journalDraft.mood,
      tags: parseTags(journalDraft.tags),
      favorite: activeJournalEntry?.favorite ?? false,
    };

    try {
      const savedEntry = editingJournalId
        ? await workoutApi.updateDiaryEntry(editingJournalId, payload)
        : await workoutApi.createDiaryEntry(payload);

      setJournalEntries(previousEntries =>
        sortEntriesByUpdatedAt(
          previousEntries.some(entry => entry.id === savedEntry.id)
            ? previousEntries.map(entry => (entry.id === savedEntry.id ? savedEntry : entry))
            : [savedEntry, ...previousEntries],
        ),
      );

      toastSuccess(
        editingJournalId ? 'Progress report updated' : 'Progress report saved',
        'Your journal history has been updated.',
      );
      resetJournalEditor();
    } catch (error) {
      console.error('Error saving progress journal:', error);
      toastError('Save failed', 'We could not save this report right now.');
    } finally {
      setSavingJournal(false);
    }
  };

  const deleteJournalEntry = async (entryId: number) => {
    try {
      await workoutApi.deleteDiaryEntry(entryId);
      setJournalEntries(previousEntries => previousEntries.filter(entry => entry.id !== entryId));
      if (editingJournalId === entryId) {
        resetJournalEditor();
      }
      toastSuccess('Progress report deleted', 'The journal entry has been removed.');
    } catch (error) {
      console.error('Error deleting progress journal:', error);
      toastError('Delete failed', 'We could not remove this report right now.');
    }
  };

  const promptDeleteJournalEntry = (entryId: number) => {
    Alert.alert(
      'Delete progress report?',
      'This report will be removed from your journal history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteJournalEntry(entryId);
          },
        },
      ],
    );
  };

  const toggleJournalFavorite = async (entryId: number) => {
    try {
      const updatedEntry = await workoutApi.toggleDiaryFavorite(entryId);
      setJournalEntries(previousEntries =>
        sortEntriesByUpdatedAt(
          previousEntries.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry)),
        ),
      );
    } catch (error) {
      console.error('Error toggling journal favorite:', error);
      toastError('Update failed', 'We could not update the saved report.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.accent}
            colors={[palette.accent]}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey and keep a personal journal.</Text>
        </View>

        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={fitnessTheme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}>
              <MaterialCommunityIcons name="dumbbell" size={24} color={palette.textPrimary} />
              <Text style={styles.cardValue}>{progressData.totalWorkouts}</Text>
              <Text style={styles.cardLabel}>Total Workouts</Text>
            </LinearGradient>
          </View>

          <View style={styles.overviewCard}>
            <LinearGradient
              colors={fitnessTheme.gradients.energy}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}>
              <Ionicons name="flame" size={24} color={palette.textPrimary} />
              <Text style={styles.cardValue}>{progressData.totalCalories}</Text>
              <Text style={styles.cardLabel}>Calories Burned</Text>
            </LinearGradient>
          </View>

          <View style={styles.overviewCard}>
            <LinearGradient
              colors={fitnessTheme.gradients.sports}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}>
              <Ionicons name="time" size={24} color={palette.textPrimary} />
              <Text style={styles.cardValue}>{Math.round(progressData.totalDuration / 60)}h</Text>
              <Text style={styles.cardLabel}>Total Time</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyContainer}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <View style={styles.dayBar}>
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        height: day.workouts > 0 ? `${Math.min(day.workouts / 2, 1) * 100}%` : '0%',
                        backgroundColor: day.workouts > 0 ? palette.accent : palette.subtleFill,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayValue}>{day.workouts}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <LinearGradient
                colors={[getStreakColor(progressData.currentStreak), palette.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.streakGradient}>
                <Ionicons name="flame" size={32} color={palette.textPrimary} />
                <Text style={styles.streakValue}>{progressData.currentStreak}</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
              </LinearGradient>
            </View>
            <View style={styles.streakCard}>
              <LinearGradient
                colors={fitnessTheme.gradients.flexibility}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.streakGradient}>
                <Ionicons name="trophy" size={32} color={palette.textPrimary} />
                <Text style={styles.streakValue}>{progressData.longestStreak}</Text>
                <Text style={styles.streakLabel}>Best Streak</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Progress</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {monthlyStats.map((month, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: `${Math.min(month.workouts / 30, 1) * 100}%`,
                        backgroundColor: palette.accent,
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{month.month}</Text>
                  <Text style={styles.chartValue}>{month.workouts}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Goal</Text>
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>Workouts This Week</Text>
              <Text style={styles.goalProgress}>
                {progressData.weeklyWorkouts} / {progressData.weeklyGoal}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(getProgressPercentage())}% Complete</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionTitle}>Progress Journal</Text>
              <Text style={styles.sectionSubtitle}>Store personal reports, reflections, and next-step notes over time.</Text>
            </View>
            <TouchableOpacity style={styles.sectionActionButton} onPress={openNewJournalEditor}>
              <Ionicons name="add-circle-outline" size={18} color={palette.accentSoft} />
              <Text style={styles.sectionActionText}>New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.journalIntroCard}>
            <View style={styles.journalIntroHeader}>
              <View style={styles.journalIntroIcon}>
                <Ionicons name="document-text-outline" size={20} color={palette.accentSoft} />
              </View>
              <View style={styles.journalIntroCopy}>
                <Text style={styles.journalIntroTitle}>Personal reports that stay with your account</Text>
                <Text style={styles.journalIntroText}>{journalPrompt}</Text>
              </View>
            </View>

            <View style={styles.journalIntroStats}>
              <View style={styles.journalStatPill}>
                <Ionicons name="albums-outline" size={14} color={palette.textSecondary} />
                <Text style={styles.journalStatText}>{journalEntries.length} saved</Text>
              </View>
              <View style={styles.journalStatPill}>
                <Ionicons name="barbell-outline" size={14} color={palette.textSecondary} />
                <Text style={styles.journalStatText}>Favorite workout: {progressData.favoriteWorkout}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryJournalButton} onPress={openNewJournalEditor}>
              <Ionicons name="create-outline" size={18} color={palette.surface} />
              <Text style={styles.primaryJournalButtonText}>Write today&apos;s report</Text>
            </TouchableOpacity>
          </View>

          {showJournalEditor ? (
            <View style={styles.journalEditor}>
              <Text style={styles.journalEditorTitle}>
                {editingJournalId ? 'Edit progress report' : 'New progress report'}
              </Text>
              <Text style={styles.journalEditorSubtitle}>
                Capture performance, recovery, motivation, and what to adjust next.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor={palette.muted}
                value={journalDraft.title}
                onChangeText={value => setJournalDraft(current => ({ ...current, title: value }))}
              />

              <View style={styles.moodSelectorRow}>
                {journalMoods.map(mood => {
                  const moodMeta = journalMoodMeta[mood];
                  const active = journalDraft.mood === mood;
                  return (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.moodChip,
                        active && {
                          backgroundColor: moodMeta.background,
                          borderColor: moodMeta.accent,
                        },
                      ]}
                      onPress={() => setJournalDraft(current => ({ ...current, mood }))}>
                      <Ionicons
                        name={moodMeta.icon}
                        size={14}
                        color={active ? moodMeta.accent : palette.textSecondary}
                      />
                      <Text
                        style={[
                          styles.moodChipText,
                          active && { color: moodMeta.accent },
                        ]}>
                        {moodMeta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Tags separated by commas"
                placeholderTextColor={palette.muted}
                value={journalDraft.tags}
                onChangeText={value => setJournalDraft(current => ({ ...current, tags: value }))}
              />

              <TextInput
                multiline
                style={[styles.input, styles.multilineInput]}
                placeholder="What changed, what felt good, what needs work next?"
                placeholderTextColor={palette.muted}
                textAlignVertical="top"
                value={journalDraft.content}
                onChangeText={value => setJournalDraft(current => ({ ...current, content: value }))}
              />

              <View style={styles.editorActionRow}>
                <TouchableOpacity style={styles.secondaryJournalButton} onPress={resetJournalEditor}>
                  <Text style={styles.secondaryJournalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryJournalButton, savingJournal && styles.buttonDisabled]}
                  disabled={savingJournal}
                  onPress={() => {
                    void handleSaveJournal();
                  }}>
                  {savingJournal ? (
                    <ActivityIndicator color={palette.surface} />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color={palette.surface} />
                      <Text style={styles.primaryJournalButtonText}>Save report</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {loadingJournal ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={palette.accentSoft} />
              <Text style={styles.loadingText}>Loading saved reports...</Text>
            </View>
          ) : journalEntries.length === 0 ? (
            <View style={styles.emptyJournalCard}>
              <Ionicons name="book-outline" size={22} color={palette.textSecondary} />
              <Text style={styles.emptyJournalTitle}>No saved reports yet</Text>
              <Text style={styles.emptyJournalText}>
                Start logging progress so you can review how training, recovery, and motivation evolve over time.
              </Text>
            </View>
          ) : (
            journalEntries.map(entry => {
              const moodMeta = journalMoodMeta[entry.mood] || journalMoodMeta.reflective;
              return (
                <View key={entry.id} style={styles.journalEntryCard}>
                  <View style={styles.journalEntryHeader}>
                    <View style={styles.journalEntryHeaderCopy}>
                      <Text style={styles.journalEntryTitle}>{entry.title}</Text>
                      <Text style={styles.journalEntryDate}>{formatEntryDate(entry.updatedAt || entry.createdAt)}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => {
                        void toggleJournalFavorite(entry.id);
                      }}>
                      <Ionicons
                        name={entry.favorite ? 'star' : 'star-outline'}
                        size={18}
                        color={entry.favorite ? '#F4A11A' : palette.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.journalEntryMetaRow}>
                    <View
                      style={[
                        styles.journalMoodBadge,
                        { backgroundColor: moodMeta.background },
                      ]}>
                      <Ionicons name={moodMeta.icon} size={14} color={moodMeta.accent} />
                      <Text style={[styles.journalMoodText, { color: moodMeta.accent }]}>
                        {moodMeta.label}
                      </Text>
                    </View>

                    {(entry.tags || []).slice(0, 3).map(tag => (
                      <View key={`${entry.id}-${tag}`} style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.journalEntryBody} numberOfLines={4}>
                    {entry.content || 'No written notes yet.'}
                  </Text>

                  <View style={styles.journalActionRow}>
                    <TouchableOpacity
                      style={styles.inlineActionButton}
                      onPress={() => openEditJournalEditor(entry)}>
                      <Ionicons name="create-outline" size={16} color={palette.textSecondary} />
                      <Text style={styles.inlineActionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.inlineActionButton}
                      onPress={() => promptDeleteJournalEntry(entry.id)}>
                      <Ionicons name="trash-outline" size={16} color={palette.danger} />
                      <Text style={[styles.inlineActionText, styles.dangerText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementItem}>
              <LinearGradient colors={fitnessTheme.gradients.energy} style={styles.achievementIcon}>
                <Ionicons name="medal" size={24} color={palette.textPrimary} />
              </LinearGradient>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>First Week</Text>
                <Text style={styles.achievementDesc}>Complete 7 workouts in a week</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <LinearGradient colors={fitnessTheme.gradients.sports} style={styles.achievementIcon}>
                <Ionicons name="checkmark-circle" size={24} color={palette.textPrimary} />
              </LinearGradient>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Consistency</Text>
                <Text style={styles.achievementDesc}>Work out 3 days in a row</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Areas</Text>
          <View style={styles.improvementContainer}>
            {progressData.improvementAreas.length > 0 ? (
              progressData.improvementAreas.map((area, index) => (
                <View key={index} style={styles.improvementItem}>
                  <MaterialCommunityIcons name="target" size={20} color={palette.accent} />
                  <Text style={styles.improvementText}>{area}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyImprovementText}>
                Keep logging workouts to unlock improvement suggestions.
              </Text>
            )}
          </View>
        </View>

        {loadingScreen ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={palette.accentSoft} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default ProgressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: palette.textPrimary,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  overviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
    marginTop: -6,
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sectionActionText: {
    color: palette.accentSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 8,
    fontWeight: '600',
  },
  dayBar: {
    width: 20,
    height: 60,
    backgroundColor: palette.mutedFill,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  dayValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  streakLabel: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    gap: 12,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 18,
    borderRadius: 10,
    minHeight: 20,
  },
  chartLabel: {
    marginTop: 8,
    fontSize: 12,
    color: palette.muted,
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  goalContainer: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  progressBar: {
    height: 10,
    backgroundColor: palette.subtleFill,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.accent,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  journalIntroCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16,
  },
  journalIntroHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  journalIntroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalIntroCopy: {
    flex: 1,
    gap: 4,
  },
  journalIntroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  journalIntroText: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.textSecondary,
  },
  journalIntroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  journalStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  journalStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  primaryJournalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryJournalButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.surface,
  },
  journalEditor: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
    marginTop: 16,
  },
  journalEditorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  journalEditorSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
  },
  input: {
    backgroundColor: palette.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: palette.textPrimary,
  },
  multilineInput: {
    minHeight: 140,
    paddingTop: 14,
  },
  moodSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
  },
  moodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  editorActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryJournalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    paddingVertical: 14,
  },
  secondaryJournalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingCard: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyJournalCard: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyJournalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  emptyJournalText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  journalEntryCard: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    gap: 14,
  },
  journalEntryHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  journalEntryHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  journalEntryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  journalEntryDate: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalEntryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  journalMoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  journalMoodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagBadgeText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '700',
  },
  journalEntryBody: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.textPrimary,
  },
  journalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  inlineActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  dangerText: {
    color: palette.danger,
  },
  achievementsContainer: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
    gap: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  achievementDesc: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  improvementContainer: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  improvementText: {
    fontSize: 14,
    color: palette.textPrimary,
    flex: 1,
  },
  emptyImprovementText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
  },
  footerLoading: {
    paddingVertical: 12,
  },
});
