import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface AlarmSettings {
  enabled: boolean;
  time: string; // HH:MM 형식
  repeatDays: string[]; // ['monday', 'tuesday', ...]
}

// 알람 설정 저장 키
const ALARM_SETTINGS_KEY = 'alarm_settings';

// 알람 ID 상수
const ALARM_NOTIFICATION_ID = 'daily_survey_alarm';

class AlarmService {
  // 알람 권한 요청
  static async requestPermissions(): Promise<boolean> {
    try {
      // 웹에서는 알람 권한이 지원되지 않음
      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 기능이 제한됩니다.');
        return false;
      }

      // Expo Go에서는 알림 기능이 제한되지만, 개발 빌드에서는 작동해야 함
      // __DEV__ 체크는 제거하고 실제 권한 상태만 확인

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

  // 알람 스케줄링
  static async scheduleAlarm(settings: AlarmSettings): Promise<void> {
    try {
      // 웹에서는 알람 스케줄링이 지원되지 않음
      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 스케줄링이 지원되지 않습니다. 설정만 저장됩니다.');
        await this.saveAlarmSettings(settings);
        return;
      }

      // 개발 빌드에서는 알림이 작동해야 하므로 제한하지 않음
      // 단, 웹과 Expo Go 환경에서는 제한됨

      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('알람 권한이 없습니다.');
      }

      // 기존 알람 취소
      await this.cancelAlarm();

      if (!settings.enabled) {
        return;
      }

      // 설정 저장
      await this.saveAlarmSettings(settings);

      // 반복 요일이 없으면 매일로 설정
      const repeatDays = settings.repeatDays.length > 0 ? settings.repeatDays : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      // 각 요일별로 알람 스케줄링
      for (const day of repeatDays) {
        const weekday = this.getWeekdayNumber(day);
        const [hour, minute] = settings.time.split(':').map(Number);

        const notificationConfig: Notifications.NotificationRequestInput = {
          identifier: `${ALARM_NOTIFICATION_ID}_${day}`,
          content: {
            title: '📋 문진 시간입니다!',
            body: '오늘의 문진을 완료해주세요.',
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'alarm' },
            ...(Platform.OS === 'android' && {
              android: {
                channelId: 'alarm',
              },
            } as any),
          },
          trigger: {
            weekday,
            hour,
            minute,
            repeats: true,
          } as Notifications.CalendarTriggerInput,
        };

        await Notifications.scheduleNotificationAsync(notificationConfig);
      }

      console.log('알람이 성공적으로 설정되었습니다.');
    } catch (error) {
      console.error('알람 스케줄링 실패:', error);
      throw error;
    }
  }

  // 알람 취소
  static async cancelAlarm(): Promise<void> {
    try {
      // 웹에서는 알람 취소가 지원되지 않음
      if (Platform.OS === 'web') {
        console.log('웹에서는 알람 취소가 지원되지 않습니다.');
        return;
      }

      // 모든 알람 취소
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알람이 취소되었습니다.');
    } catch (error) {
      console.error('알람 취소 실패:', error);
      throw error;
    }
  }

  // 테스트 알람 발송
  static async testAlarm(): Promise<void> {
    try {
      // 웹에서는 테스트 알람이 지원되지 않음
      if (Platform.OS === 'web') {
        console.log('웹에서는 테스트 알람이 지원되지 않습니다.');
        throw new Error('웹에서는 테스트 알람이 지원되지 않습니다.');
      }

      // Expo Go에서는 알림 기능이 제한됨
      if (__DEV__ && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        console.log('Expo Go에서는 테스트 알람이 지원되지 않습니다.');
        throw new Error('Expo Go에서는 테스트 알람이 지원되지 않습니다. 개발 빌드를 사용해주세요.');
      }

      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('알람 권한이 없습니다.');
      }

      // 즉시 알람 발송
      const testNotificationConfig: Notifications.NotificationRequestInput = {
        content: {
          title: '🔔 테스트 알람',
          body: '알람이 정상적으로 작동합니다!',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'test' },
          ...(Platform.OS === 'android' && {
            android: {
              channelId: 'alarm',
            },
          } as any),
        },
        trigger: null, // 즉시 발송
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
    return dayMap[day] || 2; // 기본값은 월요일
  }

  // 스케줄된 알람 목록 확인
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      // 웹에서는 스케줄된 알람 조회가 지원되지 않음
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
}

export default AlarmService;
