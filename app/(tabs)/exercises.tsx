import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/lib/AppContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import Colors from '@/constants/colors';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { subjects } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const difficulties = [
    { value: 1, label: 'سهل', color: Colors.success },
    { value: 2, label: 'متوسط', color: Colors.warning },
    { value: 3, label: 'صعب', color: Colors.danger },
  ];

  const startQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const params = new URLSearchParams();
    if (selectedSubject) params.set('subjectId', selectedSubject.toString());
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty.toString());
    router.push(`/quiz?${params.toString()}`);
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
        <Text style={styles.title}>التمارين</Text>
        <Text style={styles.subtitle}>اختر المادة ومستوى الصعوبة</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر المادة</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectsList}
          >
            <Pressable
              style={[
                styles.subjectChip,
                selectedSubject === null && styles.subjectChipSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedSubject(null);
              }}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  selectedSubject === null && styles.subjectChipTextSelected,
                ]}
              >
                الكل
              </Text>
            </Pressable>
            {subjects.map((subject) => (
              <Pressable
                key={subject.id}
                style={[
                  styles.subjectChip,
                  { borderColor: subject.color },
                  selectedSubject === subject.id && {
                    backgroundColor: subject.color,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSubject(subject.id);
                }}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    { color: subject.color },
                    selectedSubject === subject.id && { color: '#fff' },
                  ]}
                >
                  {subject.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مستوى الصعوبة</Text>
          <View style={styles.difficultyOptions}>
            <Pressable
              style={[
                styles.difficultyChip,
                selectedDifficulty === null && styles.difficultyChipSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDifficulty(null);
              }}
            >
              <Text
                style={[
                  styles.difficultyChipText,
                  selectedDifficulty === null && styles.difficultyChipTextSelected,
                ]}
              >
                الكل
              </Text>
            </Pressable>
            {difficulties.map((diff) => (
              <Pressable
                key={diff.value}
                style={[
                  styles.difficultyChip,
                  { borderColor: diff.color },
                  selectedDifficulty === diff.value && {
                    backgroundColor: diff.color,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDifficulty(diff.value);
                }}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    { color: diff.color },
                    selectedDifficulty === diff.value && { color: '#fff' },
                  ]}
                >
                  {diff.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.quizOptions}>
          <View style={styles.quizOption}>
            <View style={styles.quizOptionIcon}>
              <Ionicons name="flash" size={32} color={Colors.secondary} />
            </View>
            <View style={styles.quizOptionInfo}>
              <Text style={styles.quizOptionTitle}>تمرين سريع</Text>
              <Text style={styles.quizOptionDesc}>10 أسئلة متنوعة</Text>
            </View>
          </View>
        </View>

        <PrimaryButton title="ابدأ التمرين" onPress={startQuiz} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: 12,
  },
  subjectsList: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  subjectChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  subjectChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  subjectChipTextSelected: {
    color: '#fff',
  },
  difficultyOptions: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  difficultyChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  difficultyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  difficultyChipTextSelected: {
    color: '#fff',
  },
  quizOptions: {
    marginBottom: 24,
  },
  quizOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  quizOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  quizOptionInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quizOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  quizOptionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
