import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '@/lib/AppContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import Colors from '@/constants/colors';

type Step = 'welcome' | 'exam_date' | 'daily_goal' | 'pomodoro';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { updateAppSettings } = useApp();
  
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(60);
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const dailyGoalOptions = [30, 45, 60, 90, 120];
  const pomodoroWorkOptions = [15, 20, 25, 30, 45];
  const pomodoroBreakOptions = [3, 5, 10, 15];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const steps: Step[] = ['welcome', 'exam_date', 'daily_goal', 'pomodoro'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const steps: Step[] = ['welcome', 'exam_date', 'daily_goal', 'pomodoro'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await updateAppSettings({
        exam_date: examDate.toISOString().split('T')[0],
        daily_minutes_goal: dailyGoal,
        pomodoro_work: pomodoroWork,
        pomodoro_break: pomodoroBreak,
        onboarding_complete: 1,
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.welcomeIcon}
      >
        <Ionicons name="school" size={64} color="#fff" />
      </LinearGradient>
      <Text style={styles.welcomeTitle}>مرحباً بك في مساعد البروفيه</Text>
      <Text style={styles.welcomeSubtitle}>
        تطبيقك الذكي للتحضير لشهادة التعليم المتوسط
      </Text>
      <View style={styles.featuresList}>
        <FeatureItem icon="calendar" text="خطة دراسية مخصصة" />
        <FeatureItem icon="timer" text="مؤقت بومودورو للتركيز" />
        <FeatureItem icon="checkmark-circle" text="تمارين مع تصحيح فوري" />
        <FeatureItem icon="analytics" text="تحليل نقاط الضعف" />
      </View>
    </View>
  );

  const renderExamDate = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="calendar" size={48} color={Colors.primary} />
        <Text style={styles.stepTitle}>تاريخ الامتحان</Text>
        <Text style={styles.stepSubtitle}>متى موعد امتحان البروفيه؟</Text>
      </View>
      
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>{formatDate(examDate)}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.primary} />
      </Pressable>
      
      {showDatePicker && (
        <DateTimePicker
          value={examDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setExamDate(date);
          }}
          minimumDate={new Date()}
        />
      )}
      
      <Text style={styles.daysLeft}>
        باقي {Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوماً
      </Text>
    </View>
  );

  const renderDailyGoal = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="time" size={48} color={Colors.secondary} />
        <Text style={styles.stepTitle}>هدف الدراسة اليومي</Text>
        <Text style={styles.stepSubtitle}>كم دقيقة تريد الدراسة يومياً؟</Text>
      </View>
      
      <View style={styles.optionsGrid}>
        {dailyGoalOptions.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              dailyGoal === option && styles.optionButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDailyGoal(option);
            }}
          >
            <Text
              style={[
                styles.optionButtonText,
                dailyGoal === option && styles.optionButtonTextSelected,
              ]}
            >
              {option} دقيقة
            </Text>
          </Pressable>
        ))}
      </View>
      
      <Text style={styles.goalNote}>
        {dailyGoal < 60
          ? 'بداية جيدة! يمكنك زيادة الوقت لاحقاً.'
          : dailyGoal < 90
          ? 'هدف ممتاز للتحضير الجيد!'
          : 'رائع! تحضير مكثف للتفوق.'}
      </Text>
    </View>
  );

  const renderPomodoro = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="hourglass" size={48} color={Colors.accent} />
        <Text style={styles.stepTitle}>إعدادات البومودورو</Text>
        <Text style={styles.stepSubtitle}>حدد فترات العمل والراحة</Text>
      </View>
      
      <Text style={styles.pomodoroLabel}>مدة فترة العمل</Text>
      <View style={styles.optionsGrid}>
        {pomodoroWorkOptions.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButtonSmall,
              pomodoroWork === option && styles.optionButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPomodoroWork(option);
            }}
          >
            <Text
              style={[
                styles.optionButtonText,
                pomodoroWork === option && styles.optionButtonTextSelected,
              ]}
            >
              {option} د
            </Text>
          </Pressable>
        ))}
      </View>
      
      <Text style={styles.pomodoroLabel}>مدة فترة الراحة</Text>
      <View style={styles.optionsGrid}>
        {pomodoroBreakOptions.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButtonSmall,
              pomodoroBreak === option && styles.optionButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPomodoroBreak(option);
            }}
          >
            <Text
              style={[
                styles.optionButtonText,
                pomodoroBreak === option && styles.optionButtonTextSelected,
              ]}
            >
              {option} د
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const getStepIndex = () => {
    const steps: Step[] = ['welcome', 'exam_date', 'daily_goal', 'pomodoro'];
    return steps.indexOf(currentStep);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressContainer}>
        {['welcome', 'exam_date', 'daily_goal', 'pomodoro'].map((step, index) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              index <= getStepIndex() && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'exam_date' && renderExamDate()}
        {currentStep === 'daily_goal' && renderDailyGoal()}
        {currentStep === 'pomodoro' && renderPomodoro()}
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {currentStep !== 'welcome' && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-forward" size={24} color={Colors.textSecondary} />
          </Pressable>
        )}
        
        <View style={styles.nextButtonContainer}>
          {currentStep === 'pomodoro' ? (
            <PrimaryButton
              title="ابدأ الآن"
              onPress={handleComplete}
              loading={isLoading}
            />
          ) : (
            <PrimaryButton title="التالي" onPress={handleNext} />
          )}
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  daysLeft: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  optionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  optionButtonSmall: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  optionButtonTextSelected: {
    color: Colors.primary,
  },
  goalNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pomodoroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  nextButtonContainer: {
    flex: 1,
  },
});
