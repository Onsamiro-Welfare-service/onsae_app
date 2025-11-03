import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossTimePicker } from '@/components/ui/TossTimePicker';
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

export default function AlarmEditScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const isEditing = !!alarmId;

  const [alarm, setAlarm] = useState<AlarmItem>({
    id: alarmId || Date.now().toString(),
    time: '09:00',
    repeatDays: [],
    enabled: true,
    name: '',
  });
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadAlarm();
    } else {
      // 새 알람 생성 시 기본 시간 설정
      const time = new Date();
      time.setHours(9, 0, 0, 0);
      setSelectedTime(time);
    }
  }, [alarmId]);

  const loadAlarm = async () => {
    try {
      setLoading(true);
      const alarms = await AlarmService.getAlarmList();
      const foundAlarm = alarms.find(a => a.id === alarmId);
      
      if (foundAlarm) {
        setAlarm(foundAlarm);
        
        // 시간 설정
        if (foundAlarm.time) {
          const [hour, minute] = foundAlarm.time.split(':').map(Number);
          const time = new Date();
          time.setHours(hour, minute, 0, 0);
          setSelectedTime(time);
        }
      }
    } catch (error) {
      console.error('알람 로드 실패:', error);
      Alert.alert('오류', '알람 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleTimePress = () => {
    setTimeModalVisible(true);
  };

  const handleTimeConfirm = (time: Date) => {
    const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    setAlarm({ ...alarm, time: timeString });
    setSelectedTime(time);
    setTimeModalVisible(false);
  };

  const toggleRepeatDay = (day: string) => {
    const newRepeatDays = alarm.repeatDays.includes(day)
      ? alarm.repeatDays.filter(d => d !== day)
      : [...alarm.repeatDays, day];
    setAlarm({ ...alarm, repeatDays: newRepeatDays });
  };

  const handleSave = async () => {
    try {
      if (alarm.repeatDays.length === 0) {
        Alert.alert('알림', '최소 하나의 요일을 선택해주세요.');
        return;
      }

      console.log('알람 저장 시도:', {
        id: alarm.id,
        time: alarm.time,
        repeatDays: alarm.repeatDays,
        enabled: alarm.enabled,
      });

      // 알람 저장 (스케줄링 포함)
      await AlarmService.saveAlarm(alarm);
      
      console.log('알람 저장 성공');
      
      // 저장 성공 메시지
      Alert.alert(
        '알람 설정 완료',
        `${formatTime(alarm.time)}에 알람이 설정되었습니다.\n요일: ${alarm.repeatDays.map(d => DAYS_OF_WEEK.find(dw => dw.key === d)?.label).join(', ')}`,
        [
          {
            text: '확인',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error: any) {
      console.error('알람 저장 실패:', error);
      Alert.alert('오류', error?.message || '알람 저장에 실패했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '알람 삭제',
      '정말로 이 알람을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await AlarmService.deleteAlarm(alarm.id);
              Alert.alert(
                '삭제 완료',
                '알람이 삭제되었습니다.',
                [
                  {
                    text: '확인',
                    onPress: () => router.back(),
                  }
                ]
              );
            } catch (error: any) {
              console.error('알람 삭제 실패:', error);
              Alert.alert('오류', error?.message || '알람 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
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
        <TossHeader title={isEditing ? '알람 편집' : '알람 추가'} showBackButton onBackPress={handleBack} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">알람 정보를 불러오는 중...</TossText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <TossHeader 
        title={isEditing ? '알람 편집' : '알람 추가'} 
        showBackButton 
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 시간 선택 카드 */}
        <TossCard style={styles.card}>
          <TossText variant="body1" color="textPrimary" style={styles.cardTitle}>
            알람 시간
          </TossText>
          <TossButton
            title={formatTime(alarm.time)}
            onPress={handleTimePress}
            variant="outline"
            size="large"
            style={styles.timeButton}
          />
        </TossCard>

        {/* 반복 요일 카드 */}
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
                variant={alarm.repeatDays.includes(day.key) ? "primary" : "outline"}
                size="xsmall"
                style={styles.dayButton}
              />
            ))}
          </View>
          <TossText variant="caption2" color="textTertiary" style={styles.hintText}>
            최소 하나의 요일을 선택해주세요
          </TossText>
        </TossCard>

        {/* 디버그 정보 (개발 모드에서만) */}
        {__DEV__ && (
          <TossCard style={styles.card}>
            <TossText variant="caption1" color="textSecondary">
              디버그 정보:{'\n'}
              시간: {alarm.time}{'\n'}
              요일: {alarm.repeatDays.join(', ')}{'\n'}
              활성화: {alarm.enabled ? '예' : '아니오'}
            </TossText>
          </TossCard>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 저장 및 삭제 버튼 */}
      <View style={styles.buttonContainer}>
        {isEditing && (
          <TossButton
            title="삭제"
            onPress={handleDelete}
            variant="outline"
            size="large"
            style={StyleSheet.flatten([styles.saveButton, styles.deleteButton])}
          />
        )}
        <TossButton
          title="저장"
          onPress={handleSave}
          variant="primary"
          size="large"
          style={styles.saveButton}
        />
      </View>

      {/* 시간 선택 모달 */}
      <TossTimePicker
        visible={timeModalVisible}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={handleTimeConfirm}
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
  timeButton: {
    width: '100%',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: TossSpacing.sm,
    marginBottom: TossSpacing.sm,
  },
  dayButton: {
    flex: 1
  },
  hintText: {
    marginTop: TossSpacing.xs,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
    borderTopWidth: 1,
    borderTopColor: TossColors.gray200,
    paddingTop: TossSpacing.md,
    gap: TossSpacing.sm,
  },
  saveButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
});
