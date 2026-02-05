import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getSubjects, getLessons } from '@/db/database';
import type { Subject, Lesson } from '@/db/types';
import { LessonCard } from '@/components/LessonCard';
import { ProgressRing } from '@/components/ProgressRing';
import Colors from '@/constants/colors';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
      const subjectId = parseInt(id, 10);
      const subjects = await getSubjects();
      const foundSubject = subjects.find((s) => s.id === subjectId);
      setSubject(foundSubject || null);

      const lessonsList = await getLessons(subjectId);
      setLessons(lessonsList);
    } catch (error) {
      console.error('Error loading subject:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedLessons = lessons.filter((l) => l.is_completed === 1).length;
  const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  if (!subject) {
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
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
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
          <View
            style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}
          >
            <Ionicons name="book" size={32} color={subject.color} />
          </View>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <View style={styles.statsRow}>
            <ProgressRing
              progress={progress}
              size={60}
              strokeWidth={6}
              color={subject.color}
            />
            <View style={styles.statsInfo}>
              <Text style={styles.statsText}>
                {completedLessons} من {lessons.length} دروس مكتملة
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>الدروس</Text>
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            title={lesson.title}
            isCompleted={lesson.is_completed === 1}
            onPress={() => router.push(`/lessons/${lesson.id}`)}
          />
        ))}
      </ScrollView>
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
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 32,
  },
  subjectIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  statsInfo: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 16,
  },
});
