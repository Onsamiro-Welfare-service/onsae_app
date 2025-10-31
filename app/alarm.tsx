import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossTimePicker } from '@/components/ui/TossTimePicker';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import AlarmService from '@/services/alarmService';

interface AlarmSettings {
  enabled: boolean;
  time: string; // HH:MM 형식
  repeatDays: string[]; // ['monday', 'tuesday', ...]
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
];

export default function AlarmScreen() {
  const router = useRouter();
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>({
    enabled: false,
    time: '09:00',
    repeatDays: [],
  });
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlarmSettings();
  }, []);

  const loadAlarmSettings = async () => {
    try {
      const settings = await AlarmService.getAlarmSettings();
      setAlarmSettings(settings);
      
      // 시간 설정
      if (settings.time) {
        const [hour, minute] = settings.time.split(':').map(Number);
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        setSelectedTime(time);
      }
    } catch (error) {
      console.error('알람 설정 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const toggleAlarm = async (enabled: boolean) => {
    try {
      const newSettings = { ...alarmSettings, enabled };
      
      if (enabled) {
        // 알람 활성화
        await AlarmService.scheduleAlarm(newSettings);
        setAlarmSettings(newSettings);
        
        // 스케줄된 알람 확인
        const scheduledNotifications = await AlarmService.getScheduledNotifications();
        const alarmCount = scheduledNotifications.filter(n => 
          n.identifier.startsWith('daily_survey_alarm')
        ).length;
        
        if (alarmCount > 0) {
          Alert.alert('알람 설정', `${alarmCount}개의 알람이 설정되었습니다!`);
        } else {
          Alert.alert('알람 설정', '알람이 설정되었습니다!');
        }
      } else {
        // 알람 비활성화
        await AlarmService.cancelAlarm();
        setAlarmSettings(newSettings);
        Alert.alert('알람 해제', '알람이 해제되었습니다.');
      }
    } catch (error: any) {
      console.error('알람 설정 실패:', error);
      const errorMessage = error?.message || '알람 설정에 실패했습니다.';
      Alert.alert('오류', errorMessage, [
        { text: '확인', style: 'default' },
        ...(errorMessage.includes('권한') ? [{ 
          text: '설정으로 이동', 
          onPress: () => {
            // 사용자가 수동으로 설정으로 이동해야 함
            Alert.alert('알림', '설정 > 앱 > 온새미로 > 알림에서 권한을 허용해주세요.');
          }
        }] : [])
      ]);
    }
  };

  const handleTimeChange = async (time: Date) => {
    try {
      const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      const newSettings = { ...alarmSettings, time: timeString };
      
      if (alarmSettings.enabled) {
        // 알람이 활성화되어 있으면 즉시 업데이트
        await AlarmService.scheduleAlarm(newSettings);
      }
      
      setAlarmSettings(newSettings);
    } catch (error: any) {
      console.error('시간 변경 실패:', error);
      Alert.alert('오류', error?.message || '시간 변경에 실패했습니다.');
    }
  };

  const toggleRepeatDay = async (day: string) => {
    try {
      const newRepeatDays = alarmSettings.repeatDays.includes(day)
        ? alarmSettings.repeatDays.filter(d => d !== day)
        : [...alarmSettings.repeatDays, day];
      
      const newSettings = { ...alarmSettings, repeatDays: newRepeatDays };
      
      if (alarmSettings.enabled) {
        // 알람이 활성화되어 있으면 즉시 업데이트
        await AlarmService.scheduleAlarm(newSettings);
      }
      
      setAlarmSettings(newSettings);
    } catch (error: any) {
      console.error('반복 요일 변경 실패:', error);
      Alert.alert('오류', error?.message || '반복 요일 변경에 실패했습니다.');
    }
  };

  const testAlarm = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('알림', '웹에서는 테스트 알람이 지원되지 않습니다. 모바일 앱에서 사용해주세요.');
        return;
      }

      if (__DEV__ && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Alert.alert('알림', 'Expo Go에서는 테스트 알람이 지원되지 않습니다. 개발 빌드를 사용해주세요.');
        return;
      }

      await AlarmService.testAlarm();
      Alert.alert('테스트 알람', '테스트 알람이 발송되었습니다!');
    } catch (error) {
      console.error('테스트 알람 실패:', error);
      Alert.alert('오류', '테스트 알람 발송에 실패했습니다.');
    }
  };

  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader title="알람 설정" showBackButton onBackPress={handleBack} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">알람 설정을 불러오는 중...</TossText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <TossHeader title="알람 설정" showBackButton onBackPress={handleBack} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 플랫폼 제한사항 안내 메시지 */}
        {(Platform.OS === 'web' || (__DEV__ && (Platform.OS === 'ios' || Platform.OS === 'android'))) && (
          <TossCard style={styles.card}>
            <TossText variant="body1" color="textPrimary" style={styles.cardTitle}>
              ⚠️ 플랫폼 제한사항
            </TossText>
            <TossText variant="caption2" color="textSecondary" style={styles.warningText}>
              {Platform.OS === 'web' 
                ? '웹에서는 실제 알람이 울리지 않습니다. 설정은 저장되며, 모바일 앱에서 실제 알람을 받을 수 있습니다.'
                : 'Expo Go에서는 알림 기능이 제한됩니다. 개발 빌드를 사용하면 모든 기능을 사용할 수 있습니다.'
              }
            </TossText>
          </TossCard>
        )}

        {/* 알람 활성화 카드 */}
        <TossCard style={styles.card}>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <TossText variant="title3" color="textPrimary">
                알람 활성화
              </TossText>
              <TossText variant="caption2" color="textSecondary">
                매일 문진 알람을 받아보세요
              </TossText>
            </View>
            <Switch
              value={alarmSettings.enabled}
              onValueChange={toggleAlarm}
              trackColor={{ false: TossColors.gray200, true: TossColors.primary }}
              thumbColor={alarmSettings.enabled ? TossColors.white : TossColors.gray400}
            />
          </View>
        </TossCard>

        {/* 시간 설정 카드 */}
        <TossCard style={styles.card}>
          <TossText variant="body1" color="textPrimary" style={styles.cardTitle}>
            알람 시간
          </TossText>
          <TossButton
            title={formatTime(alarmSettings.time)}
            onPress={() => setTimeModalVisible(true)}
            variant="outline"
            size="medium"
            style={styles.timeButton}
          />
        </TossCard>

        {/* 반복 요일 설정 카드 */}
        <TossCard style={styles.card}>
          <TossText variant="body1" color="textPrimary" style={styles.cardTitle}>
            반복 요일
          </TossText>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TossButton
                key={day.key}
                title={day.label}
                onPress={() => toggleRepeatDay(day.key)}
                variant={alarmSettings.repeatDays.includes(day.key) ? "primary" : "outline"}
                size="xsmall"
                style={styles.dayButton}
              />
            ))}
          </View>
        </TossCard>

        {/* 테스트 알람 카드 */}
        <TossCard style={styles.card}>
          <TossText variant="body1" color="textPrimary" style={styles.cardTitle}>
            테스트 알람
          </TossText>
          <TossText variant="caption2" color="textSecondary" style={styles.testDescription}>
            알람이 제대로 작동하는지 테스트해보세요
          </TossText>
          <TossButton
            title="테스트 알람 발송"
            onPress={testAlarm}
            variant="secondary"
            size="medium"
            style={styles.testButton}
          />
        </TossCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 시간 선택 모달 */}
      <TossTimePicker
        visible={timeModalVisible}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={(time) => {
          handleTimeChange(time);
          setTimeModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  card: {
    marginBottom: TossSpacing.lg,
  },
  cardTitle: {
    marginBottom: TossSpacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
  },
  timeButton: {
    width: '100%',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TossSpacing.sm,
  },
  dayButton: {
    flex: 1
  },
  testDescription: {
    marginBottom: TossSpacing.md,
  },
  testButton: {
    width: '100%',
  },
  warningText: {
    lineHeight: 18,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
});
