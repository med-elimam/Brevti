import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { SubjectCard } from '@/components/SubjectCard';
import Colors from '@/constants/colors';

export default function SubjectsScreen() {
  const insets = useSafeAreaInsets();
  const { subjectProgress } = useApp();
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
      >
        <Text style={styles.title}>المواد الدراسية</Text>
        <Text style={styles.subtitle}>اختر مادة لعرض الدروس</Text>

        {subjectProgress.map((subject) => (
          <SubjectCard
            key={subject.subject_id}
            name={subject.subject_name}
            color={subject.subject_color}
            progress={subject.progress_percent}
            totalLessons={subject.total_lessons}
            completedLessons={subject.completed_lessons}
            onPress={() => router.push(`/subjects/${subject.subject_id}`)}
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
});
