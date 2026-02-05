import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getRandomExercises, saveAttempt } from '@/db/database';
import type { Exercise } from '@/db/types';
import { ExerciseOption } from '@/components/ExerciseOption';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressRing } from '@/components/ProgressRing';
import Colors from '@/constants/colors';

const MOCK_EXAM_QUESTIONS = 30;
const MOCK_EXAM_DURATION = 60 * 60;

export default function MockExamScreen() {
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [])
  );

  useEffect(() => {
    if (!isLoading && !isComplete && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, isComplete, timeLeft]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const exercisesList = await getRandomExercises(MOCK_EXAM_QUESTIONS);
      setExercises(exercisesList);
      setAnswers(new Array(exercisesList.length).fill(null));
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const answer = answers[i];
      if (answer !== null) {
        const isCorrect = answer === exercise.correct_index;
        await saveAttempt(exercise.id, answer, isCorrect, 0);
      }
    }
    
    setIsComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = exercises.reduce((count, exercise, index) => {
    return count + (answers[index] === exercise.correct_index ? 1 : 0);
  }, 0);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحضير الامتحان...</Text>
        </View>
      </View>
    );
  }

  if (isComplete) {
    const accuracy = (correctCount / exercises.length) * 100;
    
    if (showReview) {
      return (
        <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
          <View style={styles.header}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowReview(false)}
            >
              <Ionicons name="arrow-forward" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>مراجعة الإجابات</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {exercises.map((exercise, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === exercise.correct_index;
              const options: string[] = JSON.parse(exercise.options_json);
              
              return (
                <View key={exercise.id} style={styles.reviewQuestion}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewNumber}>السؤال {index + 1}</Text>
                    <View
                      style={[
                        styles.reviewBadge,
                        isCorrect ? styles.reviewCorrect : styles.reviewWrong,
                      ]}
                    >
                      <Ionicons
                        name={isCorrect ? 'checkmark' : 'close'}
                        size={16}
                        color="#fff"
                      />
                    </View>
                  </View>
                  <Text style={styles.reviewQuestionText}>{exercise.question}</Text>
                  <Text style={styles.reviewAnswer}>
                    إجابتك: {userAnswer !== null ? options[userAnswer] : 'لم تجب'}
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.reviewCorrectAnswer}>
                      الإجابة الصحيحة: {options[exercise.correct_index]}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
          
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <PrimaryButton title="إغلاق" onPress={() => router.back()} />
          </View>
        </View>
      );
    }
    
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.resultContainer}>
          <View style={styles.resultIcon}>
            {accuracy >= 70 ? (
              <Ionicons name="trophy" size={64} color={Colors.warning} />
            ) : accuracy >= 50 ? (
              <Ionicons name="ribbon" size={64} color={Colors.success} />
            ) : (
              <Ionicons name="school" size={64} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.resultTitle}>انتهى الامتحان!</Text>
          <Text style={styles.resultSubtitle}>
            نتيجتك: {correctCount} من {exercises.length}
          </Text>

          <View style={styles.resultStats}>
            <ProgressRing
              progress={accuracy}
              size={120}
              strokeWidth={12}
              color={
                accuracy >= 70
                  ? Colors.success
                  : accuracy >= 50
                  ? Colors.warning
                  : Colors.danger
              }
            />
          </View>

          <Text style={styles.resultMessage}>
            {accuracy >= 70
              ? 'أداء ممتاز! أنت مستعد للامتحان.'
              : accuracy >= 50
              ? 'أداء جيد، تحتاج لمزيد من المراجعة.'
              : 'تحتاج للمزيد من الدراسة والتدريب.'}
          </Text>

          <View style={styles.resultButtons}>
            <PrimaryButton title="مراجعة الإجابات" onPress={() => setShowReview(true)} />
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
        <View style={styles.timerContainer}>
          <Ionicons
            name="time"
            size={20}
            color={timeLeft < 300 ? Colors.danger : Colors.primary}
          />
          <Text
            style={[
              styles.timerText,
              { color: timeLeft < 300 ? Colors.danger : Colors.primary },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
        <Text style={styles.questionCounter}>
          {currentIndex + 1}/{exercises.length}
        </Text>
      </View>

      <View style={styles.progressIndicator}>
        {exercises.map((_, index) => (
          <Pressable
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              answers[index] !== null && styles.progressDotAnswered,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentIndex(index);
            }}
          />
        ))}
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
              selected={answers[currentIndex] === index}
              correct={null}
              showResult={false}
              onSelect={() => handleSelectOption(index)}
              disabled={false}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.navButtons}>
          <Pressable
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="arrow-forward"
              size={24}
              color={currentIndex === 0 ? Colors.textLight : Colors.primary}
            />
          </Pressable>

          <View style={styles.answeredInfo}>
            <Text style={styles.answeredText}>
              أجبت على {answeredCount} من {exercises.length}
            </Text>
          </View>

          <Pressable
            style={[
              styles.navButton,
              currentIndex === exercises.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex === exercises.length - 1}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                currentIndex === exercises.length - 1
                  ? Colors.textLight
                  : Colors.primary
              }
            />
          </Pressable>
        </View>

        <PrimaryButton
          title={`إنهاء الامتحان (${answeredCount}/${exercises.length})`}
          onPress={handleFinish}
          variant={answeredCount === exercises.length ? 'primary' : 'secondary'}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  placeholder: {
    width: 44,
  },
  progressIndicator: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  progressDotAnswered: {
    backgroundColor: Colors.success,
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  answeredInfo: {
    flex: 1,
    alignItems: 'center',
  },
  answeredText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    marginBottom: 24,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  resultButtons: {
    width: '100%',
  },
  reviewQuestion: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reviewBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCorrect: {
    backgroundColor: Colors.success,
  },
  reviewWrong: {
    backgroundColor: Colors.danger,
  },
  reviewQuestionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 24,
  },
  reviewAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'right',
    marginTop: 4,
  },
});
