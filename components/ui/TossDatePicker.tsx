import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { TossButton } from '@/components/ui/TossButton';
import { TossText } from '@/components/ui/TossText';

interface TossDatePickerProps {
  visible: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function TossDatePicker({
  visible,
  selectedDate,
  onDateChange,
  onClose,
  onConfirm,
}: TossDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // 달력 헬퍼 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isToday = (day: number, month: Date) => {
    const today = new Date();
    return day === today.getDate() && 
           month.getMonth() === today.getMonth() && 
           month.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number, month: Date) => {
    return day === selectedDate.getDate() && 
           month.getMonth() === selectedDate.getMonth() && 
           month.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TossText variant="title2" color="textPrimary" style={styles.modalTitle}>
            날짜 선택
          </TossText>
          
          {/* 달력 헤더 */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
            >
              <TossText variant="body1" color="textPrimary">◀</TossText>
            </TouchableOpacity>
            
            <TossText variant="title2" color="textPrimary" style={styles.monthTitle}>
              {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </TossText>
            
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
            >
              <TossText variant="body1" color="textPrimary">▶</TossText>
            </TouchableOpacity>
          </View>
          
          {/* 달력 그리드 */}
          <View style={styles.calendarGrid}>
            {/* 요일 헤더 */}
            <View style={styles.weekdayHeader}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <View key={index} style={styles.weekdayCell}>
                  <TossText variant="caption1" color="textSecondary">{day}</TossText>
                </View>
              ))}
            </View>
            
            {/* 날짜 그리드 */}
            <View style={styles.daysGrid}>
              {getCalendarDays(currentMonth).map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day && isToday(day, currentMonth) ? styles.todayCell : null,
                    day && isSelected(day, currentMonth) ? styles.selectedCell : null,
                  ]}
                  onPress={() => {
                    if (day) {
                      const newDate = new Date(currentMonth);
                      newDate.setDate(day);
                      onDateChange(newDate);
                    }
                  }}
                  disabled={!day}
                >
                  {day && (
                    <TossText 
                      variant="body2" 
                      color={
                        day && isSelected(day, currentMonth) ? 'white' :
                        day && isToday(day, currentMonth) ? 'primary' : 'textPrimary'
                      }
                    >
                      {day}
                    </TossText>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TossButton
              title="취소"
              onPress={onClose}
              variant="outline"
              size="medium"
              style={styles.modalButton}
            />
            <TossButton
              title="선택"
              onPress={onConfirm}
              variant="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  modalContent: {
    backgroundColor: TossColors.white,
    borderRadius: TossSpacing.lg,
    padding: TossSpacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: TossSpacing.md,
  },
  modalButton: {
    flex: 1,
  },
  // 달력 스타일
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TossSpacing.lg,
  },
  monthButton: {
    paddingVertical: TossSpacing.sm,
    paddingHorizontal: TossSpacing.md,
    backgroundColor: TossColors.gray100,
    borderRadius: TossSpacing.sm,
  },
  monthTitle: {
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    marginBottom: TossSpacing.xl,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: TossSpacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: TossSpacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TossSpacing.xs,
  },
  todayCell: {
    backgroundColor: TossColors.primaryLight,
    borderRadius: TossSpacing.sm,
  },
  selectedCell: {
    backgroundColor: TossColors.primary,
    borderRadius: TossSpacing.sm,
  },
});
