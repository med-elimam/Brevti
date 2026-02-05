import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface CountdownCardProps {
  daysLeft: number;
  examDate: string;
}

export function CountdownCard({ daysLeft, examDate }: CountdownCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.label}>باقي على الامتحان</Text>
        <View style={styles.daysContainer}>
          <Text style={styles.days}>{daysLeft}</Text>
          <Text style={styles.daysLabel}>يوم</Text>
        </View>
        <Text style={styles.date}>{formatDate(examDate)}</Text>
      </View>
      <View style={styles.decoration} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
  },
  days: {
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 8,
  },
  daysLabel: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  decoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
