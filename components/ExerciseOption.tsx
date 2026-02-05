import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface ExerciseOptionProps {
  text: string;
  index: number;
  selected: boolean;
  correct: boolean | null;
  showResult: boolean;
  onSelect: () => void;
  disabled: boolean;
}

export function ExerciseOption({
  text,
  index,
  selected,
  correct,
  showResult,
  onSelect,
  disabled,
}: ExerciseOptionProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect();
    }
  };

  const getBackgroundColor = () => {
    if (showResult) {
      if (correct === true) return Colors.success + '20';
      if (correct === false && selected) return Colors.danger + '20';
    }
    if (selected) return Colors.primary + '15';
    return Colors.surface;
  };

  const getBorderColor = () => {
    if (showResult) {
      if (correct === true) return Colors.success;
      if (correct === false && selected) return Colors.danger;
    }
    if (selected) return Colors.primary;
    return Colors.border;
  };

  const getLetterLabel = () => {
    const letters = ['أ', 'ب', 'ج', 'د'];
    return letters[index] || '';
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        pressed && !disabled && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.letterBadge,
            {
              backgroundColor: selected ? Colors.primary : Colors.borderLight,
            },
          ]}
        >
          <Text
            style={[
              styles.letter,
              { color: selected ? '#fff' : Colors.textSecondary },
            ]}
          >
            {getLetterLabel()}
          </Text>
        </View>
        <Text style={styles.text}>{text}</Text>
        {showResult && correct === true && (
          <View style={styles.resultIcon}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
        )}
        {showResult && correct === false && selected && (
          <View style={styles.resultIcon}>
            <Ionicons name="close-circle" size={24} color={Colors.danger} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  letter: {
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 24,
  },
  resultIcon: {
    marginRight: 8,
  },
});
