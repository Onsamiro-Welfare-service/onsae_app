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
  const [currentValue, setCurrentValue] = useState(value);
  const [trackWidth, setTrackWidth] = useState(295); // layout으로 갱신
  const thumbWidth = 32; // ?�잡???�비

  // Drag start thumb position (px) captured on grant
  const startPixelPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [dragPixelPos, setDragPixelPos] = useState<number | null>(null);
  const lastSteppedValueRef = useRef<number>(value);

  // ?�재 값에 ?�른 ?�잡???��???계산
  const range = Math.max(1, maximumValue - minimumValue);
  const normalizedValue = Math.max(0, Math.min(1, (currentValue - minimumValue) / range));
  const thumbPosition = normalizedValue * (trackWidth - thumbWidth);

  useEffect(() => {
    // 드래그 중이 아닐 때만 외부 값으로 업데이트
    if (!isDraggingRef.current) {
      setCurrentValue(value);
    }
  }, [value]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (evt) => {
      if (disabled) return;
      isDraggingRef.current = true;
      
      // 현재 썸 위치를 시작 위치로 설정
      const startNormalized = Math.max(0, Math.min(1, (currentValue - minimumValue) / Math.max(1, (maximumValue - minimumValue))));
      startPixelPosRef.current = startNormalized * (trackWidth - thumbWidth);
      setDragPixelPos(startPixelPosRef.current);
      onSliderStart?.();
    },
    onPanResponderMove: (evt, gestureState) => {
      if (disabled || !isDraggingRef.current) return;
      
      // 터치 위치를 직접 사용하여 절대 위치 계산
      const { locationX } = evt.nativeEvent;
      const newPixelPos = Math.max(0, Math.min(trackWidth - thumbWidth, locationX - thumbWidth / 2));
      const newValue = minimumValue + (newPixelPos / Math.max(1, (trackWidth - thumbWidth))) * (maximumValue - minimumValue);
      
      // 스텝에 맞춰 값 조정
      const steppedValue = minimumValue + Math.round((newValue - minimumValue) / step) * step;
      const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
      
      // 값이 실제로 변경되었을 때만 내부 상태 업데이트 (onValueChange는 호출하지 않음)

      console.log(clampedValue !== currentValue);
      if (clampedValue !== currentValue) {
        // 스텝에 맞춰 시각적 위치도 조정
        const denom = Math.max(1, (maximumValue - minimumValue));
        const snappedRatio = (clampedValue - minimumValue) / denom;
        const snappedPixel = snappedRatio * (trackWidth - thumbWidth);
        setDragPixelPos(snappedPixel);
        
        setCurrentValue(clampedValue);
        lastSteppedValueRef.current = clampedValue;
      }
    },
    onPanResponderRelease: () => {
      if (disabled) return;
      
      // 드래그가 끝날 때만 최종 값을 외부로 전달
      onValueChange?.(lastSteppedValueRef.current);
      
      isDraggingRef.current = false;
      setDragPixelPos(null);
      onSliderComplete?.();
    },
    onPanResponderTerminate: () => {
      isDraggingRef.current = false;
      setDragPixelPos(null);
    }
  });

  const containerStyle = [
    styles.container,
    style,
  ];

  const trackStyle = [
    styles.track,
    disabled && styles.trackDisabled,
  ];

  const visualLeft = dragPixelPos !== null ? dragPixelPos : thumbPosition;

  const thumbStyle = [
    styles.thumb,
    {
      left: visualLeft,
      backgroundColor: disabled ? TossColors.textDisabled : TossColors.primary,
    },
  ];

  const progressStyle = [
    styles.progress,
    {
      width: visualLeft + thumbWidth / 2,
    },
  ];

  const handleTrackLayout = (e: any) => {
    const w = e?.nativeEvent?.layout?.width;
    if (typeof w === 'number' && w > 0 && w !== trackWidth) {
      setTrackWidth(w);
    }
  };

  const jumpToPosition = (e: any) => {
    if (disabled) return;
    const x = e?.nativeEvent?.locationX ?? 0;
    const clampedX = Math.max(0, Math.min(trackWidth - thumbWidth, x - thumbWidth / 2));
    const newValue = minimumValue + (clampedX / Math.max(1, (trackWidth - thumbWidth))) * (maximumValue - minimumValue);
    const steppedValue = minimumValue + Math.round((newValue - minimumValue) / step) * step;
    const finalValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    setCurrentValue(finalValue);
    onValueChange?.(finalValue);
  };

  return (
    <View style={containerStyle}>
      <View
        style={styles.sliderContainer}
        onLayout={handleTrackLayout}
        onStartShouldSetResponder={() => !disabled}
        onResponderRelease={(e) => {
          // 트랙을 탭했을 때만 점프 (드래그 중엔 무시)
          if (!isDraggingRef.current) {
            jumpToPosition(e);
          }
        }}
      >
        <View style={trackStyle} />
        <View style={progressStyle} />
        <View style={thumbStyle} {...panResponder.panHandlers} />
      </View>
      
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, disabled && styles.disabledText]}>
            {labelFormat(currentValue)}
          </Text>
        </View>
      )}
      
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
  thumb: {
    width: 32,
    height: 32,
    borderRadius: TossRadius.lg,
    backgroundColor: TossColors.primary,
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
