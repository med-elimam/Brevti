import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, Vibration } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useApp } from '@/lib/AppContext';
import { saveStudySession, getSubjects } from '@/db/database';
import type { Subject } from '@/db/types';
import { PrimaryButton } from '@/components/PrimaryButton';
import Colors from '@/constants/colors';

type TimerState = 'idle' | 'work' | 'break';

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { settings, refreshData } = useApp();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useSharedValue(0);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const workMinutes = settings?.pomodoro_work || 25;
  const breakMinutes = settings?.pomodoro_break || 5;

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  const loadSubjects = async () => {
    const subjectsList = await getSubjects();
    setSubjects(subjectsList);
    if (subjectsList.length > 0) {
      setSelectedSubject(subjectsList[0]);
    }
  };

  useEffect(() => {
    if (timerState === 'idle') {
      setTimeLeft(workMinutes * 60);
      setTotalTime(workMinutes * 60);
    }
  }, [workMinutes, timerState]);

  useEffect(() => {
    if (timerState !== 'idle' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          progress.value = withTiming(1 - newTime / totalTime, { duration: 500 });
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && timerState !== 'idle') {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeLeft, totalTime]);

  const handleTimerComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500]);
    }

    if (timerState === 'work') {
      if (selectedSubject && sessionStartTime) {
        await saveStudySession(
          selectedSubject.id,
          null,
          sessionStartTime.toISOString(),
          new Date().toISOString(),
          workMinutes,
          4,
          ''
        );
        refreshData();
      }
      setCompletedSessions((prev) => prev + 1);
      setTimerState('break');
      setTimeLeft(breakMinutes * 60);
      setTotalTime(breakMinutes * 60);
      progress.value = 0;
    } else if (timerState === 'break') {
      setTimerState('work');
      setTimeLeft(workMinutes * 60);
      setTotalTime(workMinutes * 60);
      progress.value = 0;
      setSessionStartTime(new Date());
    }
  };

  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerState('work');
    setTimeLeft(workMinutes * 60);
    setTotalTime(workMinutes * 60);
    progress.value = 0;
    setSessionStartTime(new Date());
  };

  const pauseTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimerState(timerState);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('idle');
    setTimeLeft(workMinutes * 60);
    setTotalTime(workMinutes * 60);
    progress.value = 0;
  };

  const skipBreak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimerState('work');
    setTimeLeft(workMinutes * 60);
    setTotalTime(workMinutes * 60);
    progress.value = 0;
    setSessionStartTime(new Date());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const getTimerColor = () => {
    return timerState === 'break' ? Colors.success : Colors.primary;
  };

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
        <Text style={styles.title}>جلسة التركيز</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.stateLabel}>
          <Text
            style={[styles.stateLabelText, { color: getTimerColor() }]}
          >
            {timerState === 'idle'
              ? 'جاهز للبدء'
              : timerState === 'work'
              ? 'وقت الدراسة'
              : 'وقت الراحة'}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <View
            style={[
              styles.timerRing,
              { borderColor: Colors.borderLight },
            ]}
          >
            <Animated.View
              style={[
                styles.timerProgress,
                { borderColor: getTimerColor() },
                animatedProgressStyle,
              ]}
            />
            <View style={styles.timerInner}>
              <Text style={[styles.timerText, { color: getTimerColor() }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={styles.timerSubtext}>
                {completedSessions} جلسات مكتملة
              </Text>
            </View>
          </View>
        </View>

        {timerState === 'idle' && (
          <View style={styles.subjectSelector}>
            <Text style={styles.selectorLabel}>اختر المادة</Text>
            <View style={styles.subjectChips}>
              {subjects.map((subject) => (
                <Pressable
                  key={subject.id}
                  style={[
                    styles.subjectChip,
                    selectedSubject?.id === subject.id && {
                      backgroundColor: subject.color,
                      borderColor: subject.color,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSubject(subject);
                  }}
                >
                  <Text
                    style={[
                      styles.subjectChipText,
                      selectedSubject?.id === subject.id && { color: '#fff' },
                    ]}
                  >
                    {subject.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {timerState === 'idle' ? (
          <PrimaryButton title="ابدأ الجلسة" onPress={startTimer} />
        ) : timerState === 'break' ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <PrimaryButton title="تخطي الراحة" onPress={skipBreak} variant="secondary" />
            </View>
            <View style={styles.buttonHalf}>
              <PrimaryButton title="إنهاء" onPress={resetTimer} variant="danger" />
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <PrimaryButton title="إعادة تعيين" onPress={resetTimer} variant="secondary" />
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stateLabel: {
    marginBottom: 32,
  },
  stateLabelText: {
    fontSize: 24,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerProgress: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
  },
  timerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  subjectSelector: {
    width: '100%',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  subjectChips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  subjectChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});
