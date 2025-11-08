import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import AlarmService, { AlarmItem } from '@/services/alarmService';

const DAYS_OF_WEEK = [
  { key: 'sunday', label: '일' },
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
];

export default function AlarmScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const loadAlarms = async () => {
    try {
      setLoading(true);
      const alarmList = await AlarmService.getAlarmList();
      setAlarms(alarmList);
    } catch (error) {
      console.error('알람 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddAlarm = () => {
    router.push('/alarm-edit' as any);
  };

  const handleEditAlarm = (alarm: AlarmItem) => {
    router.push({
      pathname: '/alarm-edit' as any,
      params: { alarmId: alarm.id },
    });
  };

  const handleToggleAlarm = async (alarm: AlarmItem, enabled: boolean) => {
    try {
      const updatedAlarm = { ...alarm, enabled };
      await AlarmService.saveAlarm(updatedAlarm);
      await loadAlarms();
    } catch (error: any) {
      console.error('알람 토글 실패:', error);
      Alert.alert('오류', error?.message || '알람 상태 변경에 실패했습니다.');
    }
  };


  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const formatRepeatDays = (repeatDays: string[]) => {
    if (repeatDays.length === 0) return '반복 없음';
    if (repeatDays.length === 7) return '매일';
    
    const sortedDays = DAYS_OF_WEEK.filter(d => repeatDays.includes(d.key));
    return sortedDays.map(d => d.label).join(' ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader title="알람" showBackButton onBackPress={handleBack} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">알람 목록을 불러오는 중...</TossText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <TossHeader 
        title="알람" 
        showBackButton 
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {alarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <TossText variant="body1" color="textSecondary" style={styles.emptyText}>
              알람이 없습니다.{'\n'}
              + 버튼을 눌러 알람을 추가하세요.
            </TossText>
          </View>
        ) : (
          alarms.map((alarm) => (
            <TossCard key={alarm.id} style={styles.alarmCard}>
              <TouchableOpacity
                style={styles.alarmContent}
                onPress={() => handleEditAlarm(alarm)}
                activeOpacity={0.7}
              >
                <View style={styles.alarmMain}>
                  <View style={styles.alarmTimeRow}>
                    <TossText variant="title1" color="textPrimary" style={styles.alarmTime}>
                      {formatTime(alarm.time)}
                    </TossText>
                    <Switch
                      value={alarm.enabled}
                      onValueChange={(enabled) => handleToggleAlarm(alarm, enabled)}
                      trackColor={{ false: TossColors.gray200, true: TossColors.primary }}
                      thumbColor={alarm.enabled ? TossColors.white : TossColors.gray400}
                    />
                  </View>
                  
                  {alarm.name && (
                    <TossText variant="body2" color="textSecondary" style={styles.alarmName}>
                      {alarm.name}
                    </TossText>
                  )}
                  
                  <View style={styles.repeatDaysContainer}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = alarm.repeatDays.includes(day.key);
                      return (
                        <View
                          key={day.key}
                          style={[
                            styles.dayDot,
                            isSelected && alarm.enabled && styles.dayDotActive,
                          ]}
                        >
                          <TossText
                            variant="caption2"
                            color={isSelected && alarm.enabled ? 'white' : 'textTertiary'}
                          >
                            {day.label}
                          </TossText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </TouchableOpacity>
            </TossCard>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
      {/* 하단 작성 버튼 */}
      <View style={styles.buttonContainer}>
        <TossButton
          title="알람 추가하기"
          onPress={handleAddAlarm}
          variant="primary"
          size="large"
          style={styles.createButton}
        />
      </View>
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
    paddingTop: TossSpacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: TossSpacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  alarmCard: {
    marginBottom: TossSpacing.md,
  },
  alarmContent: {
    width: '100%',
  },
  alarmMain: {
    width: '100%',
  },
  alarmTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TossSpacing.sm,
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: '600',
  },
  alarmName: {
    marginBottom: TossSpacing.sm,
  },
  repeatDaysContainer: {
    flexDirection: 'row',
    gap: TossSpacing.xs,
    marginBottom: TossSpacing.xs,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TossColors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotActive: {
    backgroundColor: TossColors.primary,
  },
  repeatText: {
    marginTop: TossSpacing.xs,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
    paddingTop: TossSpacing.md,
    borderTopWidth: 1,
    borderTopColor: TossColors.gray200,
  },
  createButton: {
    width: '100%',
  },
});
