import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import { TossButton } from '@/components/ui/TossButton';
import { TossText } from '@/components/ui/TossText';

interface TossTimePickerProps {
  visible: boolean;
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
  onClose: () => void;
  onConfirm: (time: Date) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

// 시간 휠 컴포넌트
function TimeWheel({ 
  value, 
  onChange, 
  items,
  wheelId,
}: { 
  value: number; 
  onChange: (val: number) => void; 
  items: number[];
  wheelId: string;
}) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollY = useRef(0);
  const currentValueRef = useRef(value);

  // value 변경 시 ref 업데이트
  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  const currentIndex = items.indexOf(currentValueRef.current);
  const targetScrollY = currentIndex >= 0 ? currentIndex * ITEM_HEIGHT : 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        isDragging.current = true;
        startY.current = evt.nativeEvent.pageY;
        // @ts-ignore
        startScrollY.current = scrollY._value;
      },
      
      onPanResponderMove: (evt) => {
        if (!isDragging.current) return;
        
        const deltaY = evt.nativeEvent.pageY - startY.current;
        const newScrollY = startScrollY.current - deltaY;
        
        // 스크롤 범위 제한
        const minScroll = 0;
        const maxScroll = (items.length - 1) * ITEM_HEIGHT;
        const clampedScrollY = Math.max(minScroll, Math.min(maxScroll, newScrollY));
        
        scrollY.setValue(clampedScrollY);
      },
      
      onPanResponderRelease: () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        
        // 가장 가까운 아이템으로 스냅
        // @ts-ignore
        const currentScroll = scrollY._value;
        const nearestIndex = Math.round(currentScroll / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, nearestIndex));
        
        Animated.spring(scrollY, {
          toValue: clampedIndex * ITEM_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
        
        const newValue = items[clampedIndex];
        currentValueRef.current = newValue;
        onChange(newValue);
      },
    })
  ).current;

  // 외부에서 value가 변경되고 드래그 중이 아닐 때만 애니메이션
  useEffect(() => {
    if (!isDragging.current) {
      Animated.spring(scrollY, {
        toValue: targetScrollY,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    }
  }, [value, targetScrollY]);

  return (
    <View style={styles.wheelContainer} {...panResponder.panHandlers}>
      <View style={styles.wheelMask}>
        <Animated.View
          style={[
            styles.wheelItems,
            {
              transform: [
                {
                  translateY: Animated.subtract(
                    CENTER_INDEX * ITEM_HEIGHT,
                    scrollY
                  ),
                },
              ],
            },
          ]}
        >
          {items.map((item, index) => {
            const inputRange = [
              (index - 1) * ITEM_HEIGHT,
              index * ITEM_HEIGHT,
              (index + 1) * ITEM_HEIGHT,
            ];

            const opacity = scrollY.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`${wheelId}-${item}`}
                style={[
                  styles.wheelItem,
                  {
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              >
                <TossText
                  variant="title1"
                  color="textPrimary"
                  style={styles.wheelItemText}
                >
                  {String(item).padStart(2, '0')}
                </TossText>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
      
      {/* 선택 인디케이터 */}
      <View style={styles.wheelIndicator} pointerEvents="none">
        <View style={styles.orangeUnderline} />
      </View>
    </View>
  );
}

// 오전/오후 휠 컴포넌트 (현재 사용하지 않음)
// function PeriodWheel({ 
//   value, 
//   onChange 
// }: { 
//   value: 'AM' | 'PM'; 
//   onChange: (val: 'AM' | 'PM') => void;
// }) {
//   const scrollY = useRef(new Animated.Value(value === 'AM' ? 0 : ITEM_HEIGHT)).current;
//   const isDragging = useRef(false);
//   const startY = useRef(0);
//   const startScrollY = useRef(0);
//   const currentValueRef = useRef(value);
// 
//   const items = ['오전', '오후'];
// 
//   // value 변경 시 ref 업데이트
//   useEffect(() => {
//     currentValueRef.current = value;
//   }, [value]);
// 
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: () => true,
//       
//       onPanResponderGrant: (evt) => {
//         isDragging.current = true;
//         startY.current = evt.nativeEvent.pageY;
//         // @ts-ignore
//         startScrollY.current = scrollY._value;
//       },
//       
//       onPanResponderMove: (evt) => {
//         if (!isDragging.current) return;
//         
//         const deltaY = evt.nativeEvent.pageY - startY.current;
//         const newScrollY = startScrollY.current - deltaY;
//         
//         const clampedScrollY = Math.max(0, Math.min(ITEM_HEIGHT, newScrollY));
//         scrollY.setValue(clampedScrollY);
//       },
//       
//       onPanResponderRelease: () => {
//         if (!isDragging.current) return;
//         isDragging.current = false;
//         
//         // @ts-ignore
//         const currentScroll = scrollY._value;
//         const nearestIndex = Math.round(currentScroll / ITEM_HEIGHT);
//         const clampedIndex = Math.max(0, Math.min(1, nearestIndex));
//         
//         Animated.spring(scrollY, {
//           toValue: clampedIndex * ITEM_HEIGHT,
//           useNativeDriver: true,
//           tension: 100,
//           friction: 10,
//         }).start();
//         
//         const newValue = clampedIndex === 0 ? 'AM' : 'PM';
//         currentValueRef.current = newValue;
//         onChange(newValue);
//       },
//     })
//   ).current;
// 
//   // 외부에서 value가 변경되고 드래그 중이 아닐 때만 애니메이션
//   useEffect(() => {
//     if (!isDragging.current) {
//       const targetValue = value === 'AM' ? 0 : ITEM_HEIGHT;
//       Animated.spring(scrollY, {
//         toValue: targetValue,
//         useNativeDriver: true,
//         tension: 100,
//         friction: 10,
//       }).start();
//     }
//   }, [value]);
// 
//   return (
//     <View style={styles.wheelContainer} {...panResponder.panHandlers}>
//       <View style={styles.wheelMask}>
//         <Animated.View
//           style={[
//             styles.wheelItems,
//             {
//               transform: [
//                 {
//                   translateY: Animated.subtract(
//                     CENTER_INDEX * ITEM_HEIGHT,
//                     scrollY
//                   ),
//                 },
//               ],
//             },
//           ]}
//         >
//           {items.map((item, index) => {
//             const inputRange = [
//               (index - 1) * ITEM_HEIGHT,
//               index * ITEM_HEIGHT,
//               (index + 1) * ITEM_HEIGHT,
//             ];
// 
//             const opacity = scrollY.interpolate({
//               inputRange,
//               outputRange: [0.3, 1, 0.3],
//               extrapolate: 'clamp',
//             });
// 
//             const scale = scrollY.interpolate({
//               inputRange,
//               outputRange: [0.8, 1.2, 0.8],
//               extrapolate: 'clamp',
//             });
// 
//             return (
//               <Animated.View
//                 key={`period-${item}`}
//                 style={[
//                   styles.wheelItem,
//                   {
//                     opacity,
//                     transform: [{ scale }],
//                   },
//                 ]}
//               >
//                 <TossText
//                   variant="title1"
//                   color="textPrimary"
//                   style={styles.wheelItemText}
//                 >
//                   {item}
//                 </TossText>
//               </Animated.View>
//             );
//           })}
//         </Animated.View>
//       </View>
//       
//       {/* 선택 인디케이터 */}
//       <View style={styles.wheelIndicator} pointerEvents="none">
//         <View style={styles.orangeUnderline} />
//       </View>
//     </View>
//   );
// }

export function TossTimePicker({
  visible,
  selectedTime,
  onTimeChange,
  onClose,
  onConfirm,
}: TossTimePickerProps) {
  // 내부 상태로 시간 관리 (24시간 형식)
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  
  // 모달이 열릴 때 외부 시간을 가져옴
  useEffect(() => {
    if (visible) {
      setHour(selectedTime.getHours());
      setMinute(selectedTime.getMinutes());
    }
  }, [visible, selectedTime]);

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0~23
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0~59

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
  };

  const handleConfirm = () => {
    const newTime = new Date(selectedTime);
    newTime.setHours(hour);
    newTime.setMinutes(minute);
    
    onTimeChange(newTime);
    onConfirm(newTime);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TossText variant="title2" color="textPrimary" style={styles.modalTitle}>
            시간 선택
          </TossText>
          
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerRow}>
              <TimeWheel
                wheelId="hour"
                value={hour}
                onChange={handleHourChange}
                items={hours}
              />
              
              <TossText variant="title1" color="textPrimary" style={styles.timeSeparator}>
                :
              </TossText>
              
              <TimeWheel
                wheelId="minute"
                value={minute}
                onChange={handleMinuteChange}
                items={minutes}
              />
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TossButton
              title="취소"
              onPress={handleClose}
              variant="outline"
              size="medium"
              style={styles.modalButton}
            />
            <TossButton
              title="선택"
              onPress={handleConfirm}
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
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: TossSpacing.xl,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  wheelMask: {
    flex: 1,
    overflow: 'hidden',
  },
  wheelItems: {
    position: 'absolute',
    width: '100%',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 20,
  },
  wheelIndicator: {
    position: 'absolute',
    top: CENTER_INDEX * ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  orangeUnderline: {
    width: 50,
    height: 3,
    backgroundColor: TossColors.primary,
    borderRadius: 1.5,
    marginTop: ITEM_HEIGHT - 10,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: TossSpacing.sm,
  },
  timeSpacer: {
    width: TossSpacing.md,
  },
});