import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getLesson, markLessonComplete, getExercises } from '@/db/database';
import type { LessonWithSubject, Exercise } from '@/db/types';
import { PrimaryButton } from '@/components/PrimaryButton';
import Colors from '@/constants/colors';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<LessonWithSubject | null>(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const lessonId = parseInt(id, 10);
      const lessonData = await getLesson(lessonId);
      setLesson(lessonData);

      const exercises = await getExercises(lessonId);
      setExerciseCount(exercises.length);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markLessonComplete(lesson.id);
      loadData();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleStartExercises = () => {
    if (!lesson) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/quiz?lessonId=${lesson.id}`);
  };

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.subjectBadge}>
            <View
              style={[styles.subjectDot, { backgroundColor: lesson.subject_color }]}
            />
            <Text style={styles.subjectName}>{lesson.subject_name}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.is_completed === 1 && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.completedText}>مكتمل</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>ملخص الدرس</Text>
          </View>
          <Text style={styles.sectionContent}>{lesson.summary}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color={Colors.warning} />
            <Text style={styles.sectionTitle}>النقاط المهمة</Text>
          </View>
          <Text style={styles.sectionContent}>{lesson.importance_points}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.danger} />
            <Text style={styles.sectionTitle}>الأخطاء الشائعة</Text>
          </View>
          <Text style={styles.sectionContent}>{lesson.common_mistakes}</Text>
        </View>

        {exerciseCount > 0 && (
          <View style={styles.exercisesCard}>
            <View style={styles.exercisesInfo}>
              <Ionicons name="help-circle" size={32} color={Colors.secondary} />
              <View style={styles.exercisesTextContainer}>
                <Text style={styles.exercisesTitle}>تمارين متاحة</Text>
                <Text style={styles.exercisesCount}>{exerciseCount} سؤال</Text>
              </View>
            </View>
            <PrimaryButton
              title="ابدأ التمارين"
              onPress={handleStartExercises}
              variant="secondary"
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {lesson.is_completed !== 1 ? (
          <PrimaryButton title="تم إنهاء الدرس" onPress={handleMarkComplete} />
        ) : (
          <PrimaryButton
            title="ابدأ جلسة مراجعة"
            onPress={() => router.push('/timer')}
            variant="secondary"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  headerContent: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  subjectBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 6,
  },
  subjectName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  completedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  sectionContent: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'right',
  },
  exercisesCard: {
    backgroundColor: Colors.secondary + '10',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  exercisesInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  exercisesTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  exercisesCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
});
