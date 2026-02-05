import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getLessonsForReview, getRecommendedLessons } from '@/db/database';
import type { LessonWithSubject, WeakLesson } from '@/db/types';
import { LessonCard } from '@/components/LessonCard';
import { EmptyState } from '@/components/EmptyState';
import Colors from '@/constants/colors';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface DayPlan {
  date: Date;
  dayName: string;
  isToday: boolean;
  lessons: WeakLesson[];
  reviewLessons: LessonWithSubject[];
}

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [])
  );

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const recommended = await getRecommendedLessons(10);
      const reviewQueue = await getLessonsForReview();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const plan: DayPlan[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayLessons = recommended.slice(i * 2, i * 2 + 2);
        const dayReviews = reviewQueue.filter((lesson) => {
          return true;
        }).slice(0, 1);

        plan.push({
          date,
          dayName: DAYS_AR[date.getDay()],
          isToday: i === 0,
          lessons: dayLessons,
          reviewLessons: i === 0 ? reviewQueue.slice(0, 2) : [],
        });
      }

      setWeekPlan(plan);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' });
  };

  const currentDayPlan = weekPlan[selectedDay];

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
        <Text style={styles.title}>الخطة الأسبوعية</Text>
        <Text style={styles.subtitle}>خطة الدراسة للأيام القادمة</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {weekPlan.map((day, index) => (
            <Pressable
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.dayButtonSelected,
                day.isToday && styles.dayButtonToday,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDay(index);
              }}
            >
              <Text
                style={[
                  styles.dayName,
                  selectedDay === index && styles.dayNameSelected,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayDate,
                  selectedDay === index && styles.dayDateSelected,
                ]}
              >
                {formatDate(day.date)}
              </Text>
              {day.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>اليوم</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {currentDayPlan && (
          <View style={styles.dayContent}>
            {currentDayPlan.reviewLessons.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="refresh-circle" size={24} color={Colors.warning} />
                  <Text style={styles.sectionTitle}>للمراجعة</Text>
                </View>
                {currentDayPlan.reviewLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    subjectName={lesson.subject_name}
                    subjectColor={lesson.subject_color}
                    isCompleted={lesson.is_completed === 1}
                    showSubject
                    onPress={() => router.push(`/lessons/${lesson.id}`)}
                  />
                ))}
              </View>
            )}

            {currentDayPlan.lessons.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="book" size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>دروس مقترحة</Text>
                </View>
                {currentDayPlan.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.lesson_id}
                    title={lesson.lesson_title}
                    subjectName={lesson.subject_name}
                    subjectColor={lesson.subject_color}
                    isCompleted={false}
                    showSubject
                    onPress={() => router.push(`/lessons/${lesson.lesson_id}`)}
                  />
                ))}
              </View>
            )}

            {currentDayPlan.lessons.length === 0 &&
              currentDayPlan.reviewLessons.length === 0 && (
                <EmptyState
                  icon="calendar-outline"
                  title="لا توجد مهام لهذا اليوم"
                  description="استمر في الدراسة وستُضاف مهام جديدة تلقائياً"
                />
              )}
          </View>
        )}
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
  daysScroll: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingBottom: 8,
  },
  dayButton: {
    width: 80,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  dayButtonToday: {
    borderColor: Colors.accent,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: Colors.primary,
  },
  dayDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dayDateSelected: {
    color: Colors.primary,
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  dayContent: {
    marginTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});
