import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackProps } from '@navigator';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { workoutApi } from '@modules/workout/workout.api';
import fitnessTheme from '@theme/fitness.theme';

const { width } = Dimensions.get('window');

interface ProgressData {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  weeklyGoal: number;
  currentStreak: number;
  longestStreak: number;
  favoriteWorkout: string;
  improvementAreas: string[];
}

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

const ProgressScreen = ({ navigation, route }: StackProps<'ProgressStack'>) => {
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData>({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    weeklyGoal: 5,
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
    fetchProgressData();
  }, [navigation]);

  const fetchProgressData = async () => {
    try {
      const metrics = await workoutApi.getProgressMetrics();
      const summary = await workoutApi.getDashboardSummary();

      setProgressData({
        totalWorkouts: summary.totalWorkouts || 0,
        totalCalories: summary.totalCaloriesBurned || 0,
        totalDuration: summary.totalDuration || 0,
        weeklyGoal: 5,
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
    } catch (error) {
      console.error('Error fetching progress data:', error);
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
    return Math.min((progressData.totalWorkouts / (progressData.weeklyGoal * 4)) * 100, 100);
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
        }
      >
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
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
                        backgroundColor:
                          day.workouts > 0 ? palette.accent : palette.subtleFill,
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
                {progressData.totalWorkouts} / {progressData.weeklyGoal}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getProgressPercentage())}% Complete
            </Text>
          </View>
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
            {progressData.improvementAreas.map((area, index) => (
              <View key={index} style={styles.improvementItem}>
                <MaterialCommunityIcons name="target" size={20} color={palette.accent} />
                <Text style={styles.improvementText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
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
});
