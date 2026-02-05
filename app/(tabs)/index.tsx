import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, Pressable, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { CountdownCard } from '@/components/CountdownCard';
import { QuickActionButton } from '@/components/QuickActionButton';
import { LessonCard } from '@/components/LessonCard';
import { ProgressRing } from '@/components/ProgressRing';
import Colors from '@/constants/colors';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    subjectProgress,
    recommendedLessons,
    todayMinutes,
    daysUntilExam,
    refreshData,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const dailyGoal = settings?.daily_minutes_goal || 60;
  const dailyProgress = Math.min(100, (todayMinutes / dailyGoal) * 100);

  const totalProgress = subjectProgress.length > 0
    ? subjectProgress.reduce((sum, s) => sum + s.progress_percent, 0) / subjectProgress.length
    : 0;

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopInset + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>مرحباً بك</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/settings');
            }}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </Pressable>
        </View>

        {settings?.exam_date && (
          <CountdownCard daysLeft={daysUntilExam} examDate={settings.exam_date} />
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ProgressRing
              progress={dailyProgress}
              size={70}
              strokeWidth={7}
              color={Colors.accent}
            />
            <Text style={styles.statLabel}>هدف اليوم</Text>
            <Text style={styles.statValue}>{todayMinutes}/{dailyGoal} د</Text>
          </View>
          <View style={styles.statItem}>
            <ProgressRing
              progress={totalProgress}
              size={70}
              strokeWidth={7}
              color={Colors.success}
            />
            <Text style={styles.statLabel}>التقدم الكلي</Text>
            <Text style={styles.statValue}>{Math.round(totalProgress)}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="timer-outline"
              label="جلسة تركيز"
              color={Colors.primary}
              onPress={() => router.push('/timer')}
            />
            <QuickActionButton
              icon="help-circle-outline"
              label="تمارين"
              color={Colors.secondary}
              onPress={() => router.push('/(tabs)/exercises')}
            />
            <QuickActionButton
              icon="document-text-outline"
              label="امتحان تجريبي"
              color={Colors.accent}
              onPress={() => router.push('/mock')}
            />
            <QuickActionButton
              icon="calendar-outline"
              label="الخطة الأسبوعية"
              color={Colors.subjects.math}
              onPress={() => router.push('/(tabs)/plan')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ننصحك بمراجعة</Text>
          {recommendedLessons.length > 0 ? (
            recommendedLessons.map((lesson) => (
              <LessonCard
                key={lesson.lesson_id}
                title={lesson.lesson_title}
                subjectName={lesson.subject_name}
                subjectColor={lesson.subject_color}
                isCompleted={false}
                showSubject
                onPress={() => router.push(`/lessons/${lesson.lesson_id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyRecommendations}>
              <Ionicons name="checkmark-done-circle" size={48} color={Colors.success} />
              <Text style={styles.emptyText}>أحسنت! لا توجد دروس تحتاج مراجعة عاجلة</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تقدم المواد</Text>
          <View style={styles.subjectsProgress}>
            {subjectProgress.map((subject) => (
              <Pressable
                key={subject.subject_id}
                style={styles.subjectProgressItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/subjects/${subject.subject_id}`);
                }}
              >
                <View style={styles.subjectProgressHeader}>
                  <View
                    style={[
                      styles.subjectDot,
                      { backgroundColor: subject.subject_color },
                    ]}
                  />
                  <Text style={styles.subjectProgressName}>{subject.subject_name}</Text>
                  <Text style={[styles.subjectProgressPercent, { color: subject.subject_color }]}>
                    {Math.round(subject.progress_percent)}%
                  </Text>
                </View>
                <View style={styles.subjectProgressBar}>
                  <View
                    style={[
                      styles.subjectProgressFill,
                      {
                        width: `${subject.progress_percent}%`,
                        backgroundColor: subject.subject_color,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyRecommendations: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  subjectsProgress: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  subjectProgressItem: {
    marginBottom: 16,
  },
  subjectProgressHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  subjectProgressName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
  },
  subjectProgressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectProgressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
