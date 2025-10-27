import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
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
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 연도 범위 생성 (현재 연도 기준 ±50년)
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  // 월 배열
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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
            
            <View style={styles.monthYearWrapper}>
              <TouchableOpacity
                style={styles.monthYearContainer}
                onPress={() => {
                  if (showYearPicker) {
                    setShowYearPicker(false);
                  } else {
                    setShowYearPicker(true);
                    setShowMonthPicker(false);
                  }
                }}
              >
                <TossText variant="title2" color={showYearPicker ? "primary" : "textPrimary"} style={styles.monthTitle}>
                  {currentMonth.getFullYear()}년
                </TossText>
              </TouchableOpacity>

              {/* 연도 선택 모달 */}
              {showYearPicker && (
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModal}>
                    <TossText variant="title3" color="textPrimary" style={styles.pickerModalTitle}>
                      연도 선택
                    </TossText>
                    <ScrollView 
                      style={styles.pickerScrollView}
                      ref={(scrollView) => {
                        if (scrollView && showYearPicker) {
                          const selectedIndex = getYearRange().findIndex(
                            year => year === currentMonth.getFullYear()
                          );
                          setTimeout(() => {
                            scrollView.scrollTo({
                              y: selectedIndex * 57,
                              animated: false
                            });
                          }, 100);
                        }
                      }}
                    >
                      {getYearRange().map((year) => (
                        <TouchableOpacity
                          key={year}
                          onPress={() => {
                            const newDate = new Date(currentMonth);
                            newDate.setFullYear(year);
                            setCurrentMonth(newDate);
                            setShowYearPicker(false);
                          }}
                          style={[
                            styles.pickerOption,
                            currentMonth.getFullYear() === year && styles.pickerOptionSelected,
                          ]}
                        >
                          <TossText
                            variant="body1"
                            color={currentMonth.getFullYear() === year ? 'white' : 'textPrimary'}
                          >
                            {year}년
                          </TossText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.monthYearWrapper}>
              <TouchableOpacity
                style={styles.monthYearContainer}
                onPress={() => {
                  if (showMonthPicker) {
                    setShowMonthPicker(false);
                  } else {
                    setShowMonthPicker(true);
                    setShowYearPicker(false);
                  }
                }}
              >
                <TossText variant="title2" color={showMonthPicker ? "primary" : "textPrimary"} style={styles.monthTitle}>
                  {currentMonth.getMonth() + 1}월
                </TossText>
              </TouchableOpacity>

              {/* 월 선택 모달 */}
              {showMonthPicker && (
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModal}>
                    <TossText variant="title3" color="textPrimary" style={styles.pickerModalTitle}>
                      월 선택
                    </TossText>
                    <ScrollView 
                      style={styles.pickerScrollView}
                      ref={(scrollView) => {
                        if (scrollView && showMonthPicker) {
                          const selectedIndex = currentMonth.getMonth();
                          setTimeout(() => {
                            scrollView.scrollTo({
                              y: selectedIndex * 55,
                              animated: false
                            });
                          }, 100);
                        }
                      }}
                    >
                      {months.map((month) => (
                        <TouchableOpacity
                          key={month}
                          onPress={() => {
                            const newDate = new Date(currentMonth);
                            newDate.setMonth(month - 1);
                            setCurrentMonth(newDate);
                            setShowMonthPicker(false);
                          }}
                          style={[
                            styles.pickerOption,
                            currentMonth.getMonth() + 1 === month && styles.pickerOptionSelected,
                          ]}
                        >
                          <TossText
                            variant="body1"
                            color={currentMonth.getMonth() + 1 === month ? 'white' : 'textPrimary'}
                          >
                            {month}월
                          </TossText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
            
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
    position: 'relative',
    zIndex: 100,
  },
  monthButton: {
    paddingVertical: TossSpacing.sm,
    paddingHorizontal: TossSpacing.md,
    backgroundColor: TossColors.gray100,
    borderRadius: TossSpacing.sm,
  },
  monthYearContainer: {
    alignItems: 'center',
    paddingVertical: TossSpacing.sm,
  },
  monthYearWrapper: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
  },
  monthTitle: {
    textAlign: 'center',
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
  pickerModalContainer: {
    position: 'absolute',
    top: 50,
    left: '50%',
    marginLeft: -100,
    zIndex: 1000,
    width: 200,
  },
  pickerModal: {
    backgroundColor: TossColors.white,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    padding: TossSpacing.md,
    marginTop: TossSpacing.md,
    maxHeight: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerModalTitle: {
    marginBottom: TossSpacing.md,
    textAlign: 'center',
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    borderRadius: TossSpacing.sm,
    marginBottom: TossSpacing.xs,
    minHeight: 44,
  },
  pickerOptionSelected: {
    backgroundColor: TossColors.primary,
  },
});
