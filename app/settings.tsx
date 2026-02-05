import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '@/lib/AppContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateAppSettings, resetAppData, daysUntilExam } = useApp();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف كل تقدمك وإعداداتك.')) {
        performReset();
      }
    } else {
      Alert.alert(
        'إعادة تعيين البيانات',
        'هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف كل تقدمك وإعداداتك.',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'إعادة تعيين',
            style: 'destructive',
            onPress: performReset,
          },
        ]
      );
    }
  };

  const performReset = async () => {
    try {
      setIsResetting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await resetAppData();
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error resetting data:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'غير محدد';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onPress,
    color = Colors.primary,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <Pressable
      style={styles.settingItem}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-back" size={20} color={Colors.textLight} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>الإعدادات</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الامتحان</Text>
          <View style={styles.card}>
            <SettingItem
              icon="calendar"
              title="تاريخ الامتحان"
              value={formatDate(settings?.exam_date || null)}
              onPress={() => setShowDatePicker(true)}
              color={Colors.primary}
            />
            <View style={styles.separator} />
            <SettingItem
              icon="hourglass"
              title="الأيام المتبقية"
              value={`${daysUntilExam} يوم`}
              color={Colors.accent}
            />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={settings?.exam_date ? new Date(settings.exam_date) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) {
                updateAppSettings({
                  exam_date: date.toISOString().split('T')[0],
                });
              }
            }}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الدراسة</Text>
          <View style={styles.card}>
            <SettingItem
              icon="time"
              title="هدف الدراسة اليومي"
              value={`${settings?.daily_minutes_goal || 60} دقيقة`}
              color={Colors.secondary}
            />
            <View style={styles.separator} />
            <SettingItem
              icon="timer"
              title="مدة جلسة البومودورو"
              value={`${settings?.pomodoro_work || 25} دقيقة عمل / ${settings?.pomodoro_break || 5} دقيقة راحة`}
              color={Colors.accent}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات</Text>
          <View style={styles.card}>
            <SettingItem
              icon="refresh"
              title="إعادة تعيين البيانات"
              value="حذف كل التقدم والبدء من جديد"
              onPress={handleResetData}
              color={Colors.danger}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حول التطبيق</Text>
          <View style={styles.card}>
            <SettingItem
              icon="information-circle"
              title="الإصدار"
              value="1.0.0"
              color={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.developerCard}>
          <View style={styles.developerIcon}>
            <Ionicons name="code-slash" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.developerLabel}>تطوير</Text>
          <Text style={styles.developerName}>محمد الإمام</Text>
          <Text style={styles.developerNameEn}>Mohamed El Imam</Text>
        </View>
      </ScrollView>

      {isResetting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>جاري إعادة التعيين...</Text>
          </View>
        </View>
      )}
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
  backButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'right',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  settingInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  developerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  developerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  developerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  developerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  developerNameEn: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
  },
});
