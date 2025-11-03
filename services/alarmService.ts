import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface AlarmSettings {
  enabled: boolean;
  time: string; // HH:MM 형식
  repeatDays: string[]; // ['monday', 'tuesday', ...]
}

export interface AlarmItem {
  id: string;
  time: string; // HH:MM 형식
  repeatDays: string[]; // ['monday', 'tuesday', ...]
  enabled: boolean;
  name?: string; // 알람 이름 (선택사항)
}

// 알람 설정 저장 키 (기존 호환성)
const ALARM_SETTINGS_KEY = 'alarm_settings';
// 알람 목록 저장 키
const ALARM_LIST_KEY = 'alarm_list';

// 스케줄된 알림 ID 저장 키
const SCHEDULED_IDS_KEY = 'alarm_scheduled_ids';

// 알람 ID 상수
const ALARM_NOTIFICATION_ID = 'daily_survey_alarm';

class AlarmService {
  // 알람 권한 요청
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 기능이 제한됩니다.');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('알람 권한이 거부되었습니다.');
        return false;
      }

      // Android에서 알람 채널 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: '문진 알람',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('알람 권한 요청 실패:', error);
      return false;
    }
  }

  // 알람 설정 저장
  static async saveAlarmSettings(settings: AlarmSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(ALARM_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('알람 설정 저장 실패:', error);
      throw error;
    }
  }

  // 알람 설정 불러오기
  static async getAlarmSettings(): Promise<AlarmSettings> {
    try {
      const settingsString = await AsyncStorage.getItem(ALARM_SETTINGS_KEY);
      if (settingsString) {
        return JSON.parse(settingsString);
      }
      return {
        enabled: false,
        time: '09:00',
        repeatDays: [],
      };
    } catch (error) {
      console.error('알람 설정 불러오기 실패:', error);
      return {
        enabled: false,
        time: '09:00',
        repeatDays: [],
      };
    }
  }

  // 알람 취소
  static async cancelAlarm(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 취소가 지원되지 않습니다.');
        return;
      }

      const idsString = await AsyncStorage.getItem(SCHEDULED_IDS_KEY);
      if (idsString) {
        const ids: string[] = JSON.parse(idsString);
        for (const id of ids) {
          try {
            await Notifications.cancelScheduledNotificationAsync(id);
          } catch (e) {
            console.warn('개별 알람 취소 실패 id=', id, e);
          }
        }
      }

      await AsyncStorage.removeItem(SCHEDULED_IDS_KEY);
      console.log('스케줄된 알람이 취소되고 저장된 ID가 제거되었습니다.');
    } catch (error) {
      console.error('알람 취소 실패:', error);
      throw error;
    }
  }

  // 테스트 알람 발송
  static async testAlarm(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('웹에서는 테스트 알람이 지원되지 않습니다.');
        throw new Error('웹에서는 테스트 알람이 지원되지 않습니다.');
      }

      if (__DEV__ && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        console.log('Expo Go에서는 테스트 알람이 지원되지 않습니다.');
        throw new Error('Expo Go에서는 테스트 알람이 지원되지 않습니다. 개발 빌드를 사용해주세요.');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('알람 권한이 없습니다.');
      }

      const testContent: Notifications.NotificationContentInput = {
        title: '🔔 테스트 알람',
        body: '알람이 정상적으로 작동합니다!',
        sound: 'default',
        data: { type: 'test' },
      };

      if (Platform.OS === 'android') {
        (testContent as any).android = {
          channelId: 'alarm',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        };
      }

      const testNotificationConfig: Notifications.NotificationRequestInput = {
        content: testContent,
        trigger: null,
      };

      await Notifications.scheduleNotificationAsync(testNotificationConfig);

      console.log('테스트 알람이 발송되었습니다.');
    } catch (error) {
      console.error('테스트 알람 발송 실패:', error);
      throw error;
    }
  }

  // 요일 문자열을 숫자로 변환 (1=일요일, 2=월요일, ..., 7=토요일)
  private static getWeekdayNumber(day: string): number {
    const dayMap: Record<string, number> = {
      'sunday': 1,
      'monday': 2,
      'tuesday': 3,
      'wednesday': 4,
      'thursday': 5,
      'friday': 6,
      'saturday': 7,
    };
    return dayMap[day] || 2;
  }

  // 스케줄된 알람 목록 확인
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      if (Platform.OS === 'web') {
        console.log('웹에서는 스케줄된 알람 조회가 지원되지 않습니다.');
        return [];
      }

      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('스케줄된 알람 조회 실패:', error);
      return [];
    }
  }

  // 알람 상태 확인
  static async isAlarmScheduled(): Promise<boolean> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      return scheduledNotifications.some(notification => 
        notification.identifier.startsWith(ALARM_NOTIFICATION_ID)
      );
    } catch (error) {
      console.error('알람 상태 확인 실패:', error);
      return false;
    }
  }

  // 알람 목록 가져오기
  static async getAlarmList(): Promise<AlarmItem[]> {
    try {
      const alarmsString = await AsyncStorage.getItem(ALARM_LIST_KEY);
      if (alarmsString) {
        return JSON.parse(alarmsString);
      }
      return [];
    } catch (error) {
      console.error('알람 목록 불러오기 실패:', error);
      return [];
    }
  }

  // 알람 저장 (추가 또는 수정)
  static async saveAlarm(alarm: AlarmItem): Promise<void> {
    try {
      const alarms = await this.getAlarmList();
      const existingIndex = alarms.findIndex(a => a.id === alarm.id);
      
      if (existingIndex >= 0) {
        alarms[existingIndex] = alarm;
      } else {
        alarms.push(alarm);
      }
      
      await AsyncStorage.setItem(ALARM_LIST_KEY, JSON.stringify(alarms));
      
      // 활성화된 알람이면 스케줄링 (즉시 알람 없이)
      if (alarm.enabled) {
        await this.scheduleSingleAlarm(alarm);
      } else {
        await this.cancelSingleAlarm(alarm.id);
      }
    } catch (error) {
      console.error('알람 저장 실패:', error);
      throw error;
    }
  }

  // 알람 삭제
  static async deleteAlarm(alarmId: string): Promise<void> {
    try {
      const alarms = await this.getAlarmList();
      const filteredAlarms = alarms.filter(a => a.id !== alarmId);
      await AsyncStorage.setItem(ALARM_LIST_KEY, JSON.stringify(filteredAlarms));
      
      await this.cancelSingleAlarm(alarmId);
    } catch (error) {
      console.error('알람 삭제 실패:', error);
      throw error;
    }
  }

  // 다음 해당 요일의 날짜 계산 (다음 N주 계산 가능)
  private static getNextWeekdayDate(targetWeekday: number, hour: number, minute: number, weeksAhead: number = 0): Date {
    const now = new Date();
    const currentWeekday = now.getDay() + 1; // JS: 0=일요일 -> 1=일요일
    
    let daysUntilTarget = targetWeekday - currentWeekday;
    
    // 오늘이 목표 요일이고, 아직 시간이 지나지 않았다면 오늘로 설정
    if (daysUntilTarget === 0 && weeksAhead === 0) {
      const targetTime = new Date(now);
      targetTime.setHours(hour, minute, 0, 0);
      
      if (targetTime.getTime() > now.getTime()) {
        return targetTime;
      } else {
        // 이미 지난 시간이면 다음 주
        daysUntilTarget = 7;
      }
    } else if (daysUntilTarget < 0) {
      // 이번 주에 이미 지난 요일이면 다음 주
      daysUntilTarget += 7;
    }
    
    // weeksAhead 추가
    daysUntilTarget += (weeksAhead * 7);
    
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(hour, minute, 0, 0);
    
    return targetDate;
  }

  // 단일 알람 스케줄링 (Android/iOS 모두 지원)
  static async scheduleSingleAlarm(alarm: AlarmItem): Promise<void> {
    try {
      // 기존 알람 스케줄 취소
      await this.cancelSingleAlarm(alarm.id);

      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 스케줄링이 지원되지 않습니다.');
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('알람 권한이 없습니다. 설정에서 알림 권한을 허용해주세요.');
      }

      const scheduledIds: string[] = [];
      const repeatDays = alarm.repeatDays.length > 0 ? alarm.repeatDays : ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
      const [hour, minute] = alarm.time.split(':').map(Number);

      // 시간 유효성 검증
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error(`유효하지 않은 시간입니다: ${alarm.time}`);
      }

      console.log(`\n========================================`);
      console.log(`알람 스케줄링 시작`);
      console.log(`ID: ${alarm.id}`);
      console.log(`시간: ${hour}시 ${minute}분`);
      console.log(`요일: ${repeatDays.join(', ')}`);
      console.log(`플랫폼: ${Platform.OS}`);
      console.log(`========================================\n`);

      const errors: string[] = [];

      for (const day of repeatDays) {
        const weekday = this.getWeekdayNumber(day);

        const content: Notifications.NotificationContentInput = {
          title: alarm.name ? `📋 ${alarm.name}` : '📋 문진 시간입니다!',
          body: '오늘의 문진을 완료해주세요.',
          sound: 'default',
          data: { 
            type: 'alarm', 
            alarmId: alarm.id, 
            day,
            scheduledTime: `${hour}:${minute}`
          },
        };

        if (Platform.OS === 'android') {
          (content as any).android = {
            channelId: 'alarm',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            sound: 'default',
          };
        }

        // Android는 CalendarTrigger를 지원하지 않으므로 플랫폼별로 다르게 처리
        if (Platform.OS === 'ios') {
          // iOS: CalendarTrigger 사용 (매주 반복)
          const identifier = `${ALARM_NOTIFICATION_ID}_${alarm.id}_${day}`;
          const trigger: Notifications.CalendarTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday,
            hour,
            minute,
            repeats: true,
          };

          const request: Notifications.NotificationRequestInput = {
            identifier,
            content,
            trigger,
          };

          try {
            console.log(`[${day}] iOS CalendarTrigger 스케줄 시도...`);
            console.log(`  - weekday: ${weekday} (1=일요일)`);
            console.log(`  - 시간: ${hour}:${minute}`);
            
            const notificationId = await Notifications.scheduleNotificationAsync(request);
            scheduledIds.push(notificationId);
            
            console.log(`  ✓ 성공! NotificationID: ${notificationId}\n`);
          } catch (dayError: any) {
            const errorMsg = dayError?.message || String(dayError);
            console.error(`  ✗ 실패: ${errorMsg}\n`);
            errors.push(`${day}: ${errorMsg}`);
          }
        } else {
          // Android: DateTrigger 사용 (반복 불가하므로 다음 52주 분량을 미리 스케줄)
          // 실용적으로 다음 4주만 스케줄
          console.log(`[${day}] Android DateTrigger 스케줄 시도 (4주분)...`);
          console.log(`  - weekday: ${weekday} (1=일요일)`);
          console.log(`  - 시간: ${hour}:${minute}`);
          
          let weekSuccessCount = 0;
          
          for (let week = 0; week < 4; week++) {
            const nextDate = this.getNextWeekdayDate(weekday, hour, minute, week);
            const identifier = `${ALARM_NOTIFICATION_ID}_${alarm.id}_${day}_w${week}`;
            
            const trigger: Notifications.DateTriggerInput = {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: nextDate,
            };

            const request: Notifications.NotificationRequestInput = {
              identifier,
              content,
              trigger,
            };

            try {
              const notificationId = await Notifications.scheduleNotificationAsync(request);
              scheduledIds.push(notificationId);
              weekSuccessCount++;
              
              if (week === 0) {
                console.log(`  - 다음 알람: ${nextDate.toLocaleString('ko-KR')}`);
              }
            } catch (weekError: any) {
              console.error(`  ✗ ${week + 1}주차 실패: ${weekError?.message}\n`);
            }
          }
          
          if (weekSuccessCount > 0) {
            console.log(`  ✓ ${weekSuccessCount}/4주 스케줄 성공\n`);
          } else {
            const errorMsg = `모든 주차 스케줄 실패`;
            console.error(`  ✗ ${errorMsg}\n`);
            errors.push(`${day}: ${errorMsg}`);
          }
        }
      }

      if (scheduledIds.length === 0) {
        const errorMessage = `모든 알람 스케줄링에 실패했습니다.\n\n실패한 요일:\n${errors.join('\n')}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      // 스케줄된 ID 저장
      const idsKey = `${SCHEDULED_IDS_KEY}_${alarm.id}`;
      await AsyncStorage.setItem(idsKey, JSON.stringify(scheduledIds));
      
      console.log(`\n========================================`);
      console.log(`알람 스케줄링 완료`);
      console.log(`성공: ${scheduledIds.length}개 스케줄됨`);
      if (errors.length > 0) {
        console.warn(`실패: ${errors.length}개 요일\n${errors.join('\n')}`);
      }
      console.log(`========================================\n`);
      
      // 스케줄된 알람 확인 (디버깅용)
      const allScheduled = await this.getScheduledNotifications();
      console.log(`현재 스케줄된 총 알람 수: ${allScheduled.length}`);
      allScheduled.slice(0, 5).forEach((n, idx) => {
        console.log(`${idx + 1}. ${n.identifier}`);
        if (n.trigger && 'type' in n.trigger) {
          const trigger = n.trigger as any;
          if (trigger.type === 'calendar' && trigger.value) {
            const val = trigger.value;
            console.log(`   - 요일: ${val.weekday}, 시간: ${val.hour}:${val.minute}, 반복: ${val.repeats}`);
          } else if (trigger.type === 'date' && trigger.value) {
            console.log(`   - 날짜: ${new Date(trigger.value).toLocaleString('ko-KR')}`);
          }
        }
      });
      if (allScheduled.length > 5) {
        console.log(`... 외 ${allScheduled.length - 5}개`);
      }
      console.log('');

    } catch (error) {
      console.error('단일 알람 스케줄링 실패:', error);
      throw error;
    }
  }

  // 단일 알람 취소
  static async cancelSingleAlarm(alarmId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      console.log(`알람 취소 시작: ID=${alarmId}`);

      const idsKey = `${SCHEDULED_IDS_KEY}_${alarmId}`;
      const idsString = await AsyncStorage.getItem(idsKey);
      
      let cancelCount = 0;

      if (idsString) {
        const ids: string[] = JSON.parse(idsString);
        console.log(`저장된 스케줄 수: ${ids.length}`);
        
        for (const id of ids) {
          try {
            await Notifications.cancelScheduledNotificationAsync(id);
            cancelCount++;
            console.log(`  ✓ 알람 취소됨: ${id}`);
          } catch (e) {
            console.warn(`  ✗ 개별 알람 취소 실패: ${id}`, e);
          }
        }
        await AsyncStorage.removeItem(idsKey);
      }

      // identifier 패턴으로도 취소 시도
      const allNotifications = await this.getScheduledNotifications();
      for (const notification of allNotifications) {
        if (notification.identifier.includes(`${ALARM_NOTIFICATION_ID}_${alarmId}_`)) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            cancelCount++;
            console.log(`  ✓ identifier로 알람 취소됨: ${notification.identifier}`);
          } catch (e) {
            console.warn(`  ✗ 알람 취소 실패: ${notification.identifier}`, e);
          }
        }
      }
      
      console.log(`알람 취소 완료: 총 ${cancelCount}개 취소됨\n`);
    } catch (error) {
      console.error('단일 알람 취소 실패:', error);
    }
  }

  // 알람 토글 (활성화/비활성화)
  static async toggleAlarm(alarmId: string, enabled: boolean): Promise<void> {
    try {
      const alarms = await this.getAlarmList();
      const alarm = alarms.find(a => a.id === alarmId);
      
      if (!alarm) {
        throw new Error('알람을 찾을 수 없습니다.');
      }
      
      alarm.enabled = enabled;
      await this.saveAlarm(alarm);
    } catch (error) {
      console.error('알람 토글 실패:', error);
      throw error;
    }
  }
}

export default AlarmService;