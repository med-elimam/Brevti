import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Platform } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getDailyStudyStats, getAccuracyStats, getRecommendedLessons } from '@/db/database';
import type { DailyStudyStats, AccuracyStats, WeakLesson } from '@/db/types';
import { StatCard } from '@/components/StatCard';
import { LessonCard } from '@/components/LessonCard';
import { EmptyState } from '@/components/EmptyState';
import Colors from '@/constants/colors';

const screenWidth = Dimensions.get('window').width - 40;

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [studyStats, setStudyStats] = useState<DailyStudyStats[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<AccuracyStats[]>([]);
  const [weakLessons, setWeakLessons] = useState<WeakLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [])
  );

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [study, accuracy, weak] = await Promise.all([
        getDailyStudyStats(7),
        getAccuracyStats(7),
        getRecommendedLessons(5),
      ]);
      setStudyStats(study);
      setAccuracyStats(accuracy);
      setWeakLessons(weak);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalStudyMinutes = studyStats.reduce((sum, s) => sum + s.total_minutes, 0);
  const totalCorrect = accuracyStats.reduce((sum, s) => sum + s.correct, 0);
  const totalWrong = accuracyStats.reduce((sum, s) => sum + s.wrong, 0);
  const overallAccuracy = totalCorrect + totalWrong > 0
    ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
    : 0;

  const getDayLabels = () => {
    const labels: string[] = [];
    const dayNames = ['أ', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(dayNames[date.getDay()]);
    }
    return labels;
  };

  const getStudyData = () => {
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = studyStats.find((s) => s.date === dateStr);
      data.push(stat?.total_minutes || 0);
    }
    return data;
  };

  const getAccuracyData = () => {
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = accuracyStats.find((s) => s.date === dateStr);
      data.push(stat?.accuracy || 0);
    }
    return data;
  };

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 58, 95, ${opacity})`,
    labelColor: () => Colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopInset + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>الإحصائيات</Text>
        <Text style={styles.subtitle}>تتبع تقدمك الدراسي</Text>

        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            label="إجمالي الدراسة"
            value={`${totalStudyMinutes} د`}
            color={Colors.primary}
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="نسبة الصحة"
            value={`${overallAccuracy}%`}
            color={Colors.success}
          />
          <StatCard
            icon="flash-outline"
            label="الإجابات"
            value={`${totalCorrect + totalWrong}`}
            color={Colors.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وقت الدراسة (آخر 7 أيام)</Text>
          {studyStats.length > 0 ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: getDayLabels(),
                  datasets: [{ data: getStudyData() }],
                }}
                width={screenWidth}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                }}
                style={styles.chart}
                yAxisSuffix=" د"
                yAxisLabel=""
                fromZero
              />
            </View>
          ) : (
            <EmptyState
              icon="bar-chart-outline"
              title="لا توجد بيانات بعد"
              description="ابدأ جلسات الدراسة لرؤية الإحصائيات"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نسبة الإجابات الصحيحة</Text>
          {accuracyStats.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: getDayLabels(),
                  datasets: [{ data: getAccuracyData().map(v => v || 0) }],
                }}
                width={screenWidth}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                }}
                style={styles.chart}
                bezier
                yAxisSuffix="%"
                fromZero
              />
            </View>
          ) : (
            <EmptyState
              icon="trending-up-outline"
              title="لا توجد بيانات بعد"
              description="حل التمارين لرؤية نسبة الإجابات الصحيحة"
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <Text style={styles.sectionTitle}>نقاط الضعف</Text>
          </View>
          {weakLessons.length > 0 ? (
            weakLessons.slice(0, 3).map((lesson) => (
              <View key={lesson.lesson_id} style={styles.weakLessonItem}>
                <LessonCard
                  title={lesson.lesson_title}
                  subjectName={lesson.subject_name}
                  subjectColor={lesson.subject_color}
                  isCompleted={false}
                  showSubject
                  onPress={() => router.push(`/lessons/${lesson.lesson_id}`)}
                />
                <View style={styles.weakLessonStats}>
                  <View style={styles.weakStat}>
                    <Ionicons name="analytics" size={14} color={Colors.textSecondary} />
                    <Text style={styles.weakStatText}>
                      الدقة: {Math.round(lesson.accuracy)}%
                    </Text>
                  </View>
                  <View style={styles.weakStat}>
                    <Ionicons name="time" size={14} color={Colors.textSecondary} />
                    <Text style={styles.weakStatText}>
                      آخر مراجعة: {Math.round(lesson.days_since_review)} يوم
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="لا توجد نقاط ضعف"
              description="استمر في الدراسة للحفاظ على مستواك"
            />
          )}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  weakLessonItem: {
    marginBottom: 8,
  },
  weakLessonStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  weakStat: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  weakStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
