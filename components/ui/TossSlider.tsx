import { TossColors, TossRadius, TossSpacing, TossTypography } from '@/constants/toss-design-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

interface TossSliderProps {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSliderStart?: () => void;
  onSliderComplete?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  showLabels?: boolean;
  showValue?: boolean;
  labelFormat?: (value: number) => string;
}

export function TossSlider({
  value = 50,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSliderStart,
  onSliderComplete,
  disabled = false,
  style,
  showLabels = true,
  showValue = true,
  labelFormat = (value) => value.toString(),
}: TossSliderProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [trackWidth, setTrackWidth] = useState(295);
  const thumbWidth = 32;
  
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartValueRef = useRef(value);
  const pendingValueRef = useRef(value);

  // 드래그 중이 아닐 때만 외부 value를 반영
  useEffect(() => {
    if (!isDraggingRef.current) {
      setInternalValue(value);
      pendingValueRef.current = value;
    }
  }, [value]);

  // 값을 픽셀 위치로 변환
  const getThumbPosition = (val: number): number => {
    const range = maximumValue - minimumValue;
    if (range <= 0) return 0;
    const ratio = (val - minimumValue) / range;
    return ratio * (trackWidth - thumbWidth);
  };

  // 픽셀 위치를 값으로 변환
  const getValueFromPosition = (position: number): number => {
    const range = maximumValue - minimumValue;
    const availableWidth = trackWidth - thumbWidth;
    if (availableWidth <= 0) return minimumValue;
    
    const ratio = position / availableWidth;
    const rawValue = minimumValue + ratio * range;
    
    // 스텝 단위로 스냅
    const snappedValue = Math.round(rawValue / step) * step;
    
    // 범위 제한
    return Math.max(minimumValue, Math.min(maximumValue, snappedValue));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: (evt) => {
        if (disabled) return;
        
        isDraggingRef.current = true;
        dragStartXRef.current = evt.nativeEvent.pageX;
        dragStartValueRef.current = pendingValueRef.current;
        
        onSliderStart?.();
      },
      
      onPanResponderMove: (evt) => {
        if (disabled || !isDraggingRef.current) return;
        
        const currentX = evt.nativeEvent.pageX;
        const deltaX = currentX - dragStartXRef.current;
        
        // 시작 위치에서 이동한 만큼 계산
        const startPosition = getThumbPosition(dragStartValueRef.current);
        const newPosition = Math.max(0, Math.min(trackWidth - thumbWidth, startPosition + deltaX));
        
        const newValue = getValueFromPosition(newPosition);
        
        if (newValue !== pendingValueRef.current) {
          pendingValueRef.current = newValue;
          setInternalValue(newValue);
        }
      },
      
      onPanResponderRelease: () => {
        if (disabled || !isDraggingRef.current) return;
        
        isDraggingRef.current = false;
        const finalValue = pendingValueRef.current;
        
        onValueChange?.(finalValue);
        onSliderComplete?.();
      },
      
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  // 트랙 레이아웃 측정
  const handleTrackLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== trackWidth) {
      setTrackWidth(width);
    }
  };

  // 트랙 탭으로 이동
  const handleTrackPress = (event: any) => {
    if (disabled || isDraggingRef.current) return;
    
    const { locationX } = event.nativeEvent;
    const targetPosition = Math.max(0, Math.min(trackWidth - thumbWidth, locationX - thumbWidth / 2));
    const newValue = getValueFromPosition(targetPosition);
    
    setInternalValue(newValue);
    pendingValueRef.current = newValue;
    onValueChange?.(newValue);
  };

  const thumbPosition = getThumbPosition(internalValue);

  return (
    <View style={[styles.container, style]}>
      <View
        style={styles.sliderContainer}
        onLayout={handleTrackLayout}
        onStartShouldSetResponder={() => !disabled}
        onResponderRelease={handleTrackPress}
      >
        {/* 배경 트랙 */}
        <View style={[styles.track, disabled && styles.trackDisabled]} />
        
        {/* 진행 바 */}
        <View
          style={[
            styles.progress,
            {
              width: thumbPosition + thumbWidth / 2,
            },
            disabled && styles.progressDisabled,
          ]}
        />
        
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: thumbPosition,
              backgroundColor: disabled ? TossColors.textDisabled : TossColors.primary,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>

      {/* 현재 값 표시 */}
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, disabled && styles.disabledText]}>
            {labelFormat(internalValue)}
          </Text>
        </View>
      )}

      {/* 최소/최대 라벨 */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={[styles.labelText, disabled && styles.disabledText]}>
            {minimumValue}
          </Text>
          <Text style={[styles.labelText, disabled && styles.disabledText]}>
            /{maximumValue}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: TossSpacing.xl,
    backgroundColor: TossColors.white,
  },
  sliderContainer: {
    width: 295,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: TossColors.gray100,
    borderRadius: TossRadius.sm,
    position: 'absolute',
  },
  trackDisabled: {
    backgroundColor: TossColors.textDisabled,
  },
  progress: {
    height: 8,
    backgroundColor: TossColors.primary,
    borderRadius: TossRadius.sm,
    position: 'absolute',
  },
  progressDisabled: {
    backgroundColor: TossColors.textDisabled,
  },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: TossRadius.lg,
    position: 'absolute',
    elevation: 4,
    shadowColor: TossColors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  valueContainer: {
    marginTop: TossSpacing.md,
    alignItems: 'center',
  },
  valueText: {
    ...TossTypography.title1,
    color: TossColors.primary,
  },
  disabledText: {
    color: TossColors.textDisabled,
  },
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: TossSpacing.sm,
  },
  labelText: {
    ...TossTypography.caption3,
    color: TossColors.textTertiary,
  },
});