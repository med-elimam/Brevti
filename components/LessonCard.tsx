import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface LessonCardProps {
  title: string;
  subjectName?: string;
  subjectColor?: string;
  isCompleted: boolean;
  onPress: () => void;
  showSubject?: boolean;
}

export function LessonCard({
  title,
  subjectName,
  subjectColor,
  isCompleted,
  onPress,
  showSubject = false,
}: LessonCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.statusIcon,
            isCompleted ? styles.completed : styles.pending,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color="#fff" />
          ) : (
            <View style={styles.pendingDot} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {showSubject && subjectName && (
            <View style={styles.subjectTag}>
              <View
                style={[styles.subjectDot, { backgroundColor: subjectColor }]}
              />
              <Text style={styles.subjectName}>{subjectName}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-back" size={18} color={Colors.textLight} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  completed: {
    backgroundColor: Colors.success,
  },
  pending: {
    backgroundColor: Colors.borderLight,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
  },
  info: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'right',
  },
  subjectTag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 6,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  subjectName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
