import { TossColors, TossSpacing, TossTypography, TossRadius } from '@/constants/toss-design-system';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  PanResponder,
  Text,
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
  const trackWidth = 295; // 토스 디자인 기준 트랙 너비
  const thumbWidth = 32; // 손잡이 너비
  const trackHeight = 8;

  // 현재 값에 따른 손잡이 포지션 계산
  const normalizedValue = (currentValue - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = normalizedValue * (trackWidth - thumbWidth);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      onSliderStart?.();
    },
    onPanResponderMove: (_, gestureState) => {
      if (disabled) return;
      
      // 현재 값을 픽셀 위치로 변환
      const normalizedValue = (currentValue - minimumValue) / (maximumValue - minimumValue);
      const currentPixelPos = normalizedValue * (trackWidth - thumbWidth);
      
      // 새로운 픽셀 위치 계산 (제스처 이동량만큼 더함)
      const newPixelPos = Math.max(0, Math.min(trackWidth - thumbWidth, currentPixelPos + gestureState.dx));
      
      // 픽셀 위치를 값으로 변환
      const newValue = minimumValue + (newPixelPos / (trackWidth - thumbWidth)) * (maximumValue - minimumValue);
      
      // 스텝에 맞춰 값 조정
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
      
      setCurrentValue(clampedValue);
      onValueChange?.(clampedValue);
    },
    onPanResponderRelease: () => {
      if (disabled) return;
      onSliderComplete?.();
    },
  });

  const containerStyle = [
    styles.container,
    style,
  ];

  const trackStyle = [
    styles.track,
    disabled && styles.trackDisabled,
  ];

  const thumbStyle = [
    styles.thumb,
    {
      left: thumbPosition,
      backgroundColor: disabled ? TossColors.textDisabled : TossColors.primary,
    },
  ];

  const progressStyle = [
    styles.progress,
    {
      width: thumbPosition + thumbWidth / 2,
    },
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        <View style={trackStyle} />
        <View style={progressStyle} />
        <View style={thumbStyle} />
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
    width: 295,
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
