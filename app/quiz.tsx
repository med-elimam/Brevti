import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getRandomExercises, getExercises, saveAttempt } from '@/db/database';
import type { Exercise } from '@/db/types';
import { ExerciseOption } from '@/components/ExerciseOption';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressRing } from '@/components/ProgressRing';
import Colors from '@/constants/colors';

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    subjectId?: string;
    lessonId?: string;
    difficulty?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [params.subjectId, params.lessonId, params.difficulty])
  );

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      let exercisesList: Exercise[] = [];

      if (params.lessonId) {
        exercisesList = await getExercises(parseInt(params.lessonId, 10));
      } else {
        const subjectId = params.subjectId ? parseInt(params.subjectId, 10) : undefined;
        exercisesList = await getRandomExercises(10, subjectId);
      }

      if (params.difficulty) {
        const diff = parseInt(params.difficulty, 10);
        exercisesList = exercisesList.filter((e) => e.difficulty === diff);
      }

      const shuffled = exercisesList.sort(() => Math.random() - 0.5).slice(0, 10);
      setExercises(shuffled);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentExercise = exercises[currentIndex];
  const options: string[] = currentExercise
    ? JSON.parse(currentExercise.options_json)
    : [];

  const handleSelectOption = (index: number) => {
    if (showResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex(index);
  };

  const handleCheck = async () => {
    if (selectedIndex === null || !currentExercise) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowResult(true);

    const isCorrect = selectedIndex === currentExercise.correct_index;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((prev) => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    await saveAttempt(currentExercise.id, selectedIndex, isCorrect, timeSpent);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setShowResult(false);
      setStartTime(Date.now());
    } else {
      setIsComplete(true);
    }
  };

  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحميل التمارين...</Text>
        </View>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="help-circle-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>لا توجد تمارين</Text>
          <Text style={styles.emptySubtitle}>
            لم يتم العثور على تمارين تطابق اختيارك
          </Text>
          <PrimaryButton title="العودة" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  if (isComplete) {
    const accuracy = (correctCount / exercises.length) * 100;
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.resultContainer}>
          <View style={styles.resultIcon}>
            {accuracy >= 70 ? (
              <Ionicons name="trophy" size={64} color={Colors.warning} />
            ) : accuracy >= 50 ? (
              <Ionicons name="thumbs-up" size={64} color={Colors.success} />
            ) : (
              <Ionicons name="refresh" size={64} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.resultTitle}>
            {accuracy >= 70
              ? 'ممتاز!'
              : accuracy >= 50
              ? 'جيد!'
              : 'حاول مرة أخرى'}
          </Text>
          <Text style={styles.resultSubtitle}>
            أجبت على {correctCount} من {exercises.length} بشكل صحيح
          </Text>

          <View style={styles.resultStats}>
            <ProgressRing
              progress={accuracy}
              size={100}
              strokeWidth={10}
              color={
                accuracy >= 70
                  ? Colors.success
                  : accuracy >= 50
                  ? Colors.warning
                  : Colors.danger
              }
            />
          </View>

          <View style={styles.resultButtons}>
            <PrimaryButton
              title="تمارين جديدة"
              onPress={() => {
                setCurrentIndex(0);
                setSelectedIndex(null);
                setShowResult(false);
                setCorrectCount(0);
                setIsComplete(false);
                loadExercises();
              }}
            />
            <View style={{ height: 12 }} />
            <PrimaryButton
              title="العودة"
              onPress={() => router.back()}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{exercises.length}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentExercise.question}</Text>
        </View>

        <View style={styles.options}>
          {options.map((option, index) => (
            <ExerciseOption
              key={index}
              text={option}
              index={index}
              selected={selectedIndex === index}
              correct={
                showResult
                  ? index === currentExercise.correct_index
                    ? true
                    : index === selectedIndex
                    ? false
                    : null
                  : null
              }
              showResult={showResult}
              onSelect={() => handleSelectOption(index)}
              disabled={showResult}
            />
          ))}
        </View>

        {showResult && (
          <View
            style={[
              styles.explanationCard,
              selectedIndex === currentExercise.correct_index
                ? styles.explanationCorrect
                : styles.explanationWrong,
            ]}
          >
            <Text style={styles.explanationTitle}>
              {selectedIndex === currentExercise.correct_index
                ? 'إجابة صحيحة!'
                : 'إجابة خاطئة'}
            </Text>
            <Text style={styles.explanationText}>
              {currentExercise.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {!showResult ? (
          <PrimaryButton
            title="تحقق"
            onPress={handleCheck}
            disabled={selectedIndex === null}
          />
        ) : (
          <PrimaryButton
            title={currentIndex < exercises.length - 1 ? 'التالي' : 'عرض النتيجة'}
            onPress={handleNext}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 40,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 32,
  },
  options: {
    marginBottom: 16,
  },
  explanationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  explanationCorrect: {
    backgroundColor: Colors.success + '15',
    borderWidth: 2,
    borderColor: Colors.success,
  },
  explanationWrong: {
    backgroundColor: Colors.danger + '15',
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  resultStats: {
    marginBottom: 40,
  },
  resultButtons: {
    width: '100%',
  },
});
