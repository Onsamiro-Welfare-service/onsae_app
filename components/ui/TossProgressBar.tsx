import { TossColors, TossRadius } from '@/constants/toss-design-system';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';

interface TossProgressBarProps {
  progress: number; // 0-100 또는 0-1
  totalSteps?: number;
  currentStep?: number;
  variant?: 'default' | 'success' | 'warning' | 'primary';
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  fillStyle?: ViewStyle;
}

export function TossProgressBar({
  progress,
  totalSteps,
  currentStep,
  variant = 'default',
  showLabels = false,
  size = 'medium',
  animated = true,
  style,
  trackStyle,
  fillStyle,
}: TossProgressBarProps) {
  // Persist animated value across renders
  const animatedProgress = useRef(new Animated.Value(0));
  
  // 진행률 계산 (0-1 범위로 정규화)
  const normalizedProgress = React.useMemo(() => {
    if (currentStep !== undefined && totalSteps !== undefined) {
      return currentStep / totalSteps;
    }
    return progress > 1 ? progress / 100 : progress;
  }, [progress, currentStep, totalSteps]);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress.current, {
        toValue: normalizedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.current.setValue(normalizedProgress);
    }
  }, [normalizedProgress, animated]);

  const containerStyle = [
    styles.base,
    styles[size],
    style,
  ];

  const trackContainerStyle = [
    styles.trackContainer,
    styles[`${size}Track`],
    variantStyles[variant].track,
    trackStyle,
  ];

  const fillStyleAnimated = animatedProgress.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderIndicator = () => {
    if (!showLabels || !totalSteps || currentStep === undefined) return null;
    
    return (
      <View style={styles.labelContainer}>
        <View style={[styles.labels, styles[`${size}Labels`]]}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.labelDot,
                styles[`${size}Dot`],
                index < currentStep ? variantStyles[variant].activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderStepIndicator = () => {
    if (!showLabels || !totalSteps || currentStep === undefined) return null;
    
    return (
      <View style={styles.stepContainer}>
        {variantStyles[variant].stepNumbers && (
          <View style={styles.stepNumbers}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View key={index} style={styles.stepNumberContainer}>
                <View style={[
                  styles.stepNumber,
                  styles[`${size}StepNumber`],
                  index < currentStep ? variantStyles[variant].activeStepNumber : styles.inactiveStepNumber,
                ]}>
                  <View style={[
                    styles.stepNumberDot,
                    index < currentStep ? variantStyles[variant].activeStepDot : styles.inactiveStepDot,
                  ]}>
                    {index < currentStep && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {renderStepIndicator()}
      
      <View style={trackContainerStyle}>
        <Animated.View 
          style={[
            styles.fill,
            styles[`${size}Fill`],
            variantStyles[variant].fill,
            {
              width: animated ? fillStyleAnimated : `${normalizedProgress * 100}%`,
            },
            fillStyle,
          ]} 
        />
      </View>
      
      {renderIndicator()}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
  },
  
  // 크기별 스타일
  small: {
    paddingVertical: 8,
  },
  medium: {
    paddingVertical: 12,
  },
  large: {
    paddingVertical: 16,
  },
  
  // 트랙 크기
  trackContainer: {
    width: '100%',
    backgroundColor: TossColors.gray100,
    borderRadius: TossRadius.sm,
  },
  smallTrack: {
    height: 6,
  },
  mediumTrack: {
    height: 8,
  },
  largeTrack: {
    height: 12,
  },
  
  // 채우기 크기
  fill: {
    height: '100%',
    borderRadius: TossRadius.sm,
  },
  smallFill: {},
  mediumFill: {},
  largeFill: {},
  
  // 라벨
  labelContainer: {
    marginTop: 8,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallLabels: {
    width: '80%',
  },
  mediumLabels: {
    width: '90%',
  },
  largeLabels: {
    width: '100%',
  },
  
  labelDot: {
    borderRadius: 2,
  },
  smallDot: {
    width: 4,
    height: 4,
  },
  mediumDot: {
    width: 6,
    height: 6,
  },
  largeDot: {
    width: 8,
    height: 8,
  },
  
  // 단계 표시기
  stepContainer: {
    marginBottom: 12,
  },
  stepNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNumberContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepNumber: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallStepNumber: {
    width: 24,
    height: 24,
  },
  mediumStepNumber: {
    width: 32,
    height: 32,
  },
  largeStepNumber: {
    width: 40,
    height: 40,
  },
  
  stepNumberDot: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TossColors.white,
  },
  inactiveDot: {
    backgroundColor: TossColors.gray200,
  },
  inactiveStepNumber: {},
  inactiveStepDot: {
    backgroundColor: TossColors.white,
    borderColor: TossColors.gray200,
  },
});

// variantStyles를 일반 객체로 변경
const variantStyles = {
  default: {
    track: {
      backgroundColor: TossColors.gray100,
    },
    fill: {
      backgroundColor: TossColors.primary,
    },
    activeDot: {
      backgroundColor: TossColors.primary,
    },
    inactiveDot: {
      backgroundColor: TossColors.gray200,
    },
    stepNumbers: true,
    activeStepNumber: {},
    inactiveStepNumber: {},
    activeStepDot: {
      backgroundColor: TossColors.primary,
      borderColor: TossColors.primary,
    },
    inactiveStepDot: {
      backgroundColor: TossColors.white,
      borderColor: TossColors.gray200,
    },
  },
  success: {
    track: {
      backgroundColor: TossColors.gray100,
    },
    fill: {
      backgroundColor: TossColors.success,
    },
    activeDot: {
      backgroundColor: TossColors.success,
    },
    inactiveDot: {
      backgroundColor: TossColors.gray200,
    },
    stepNumbers: true,
    activeStepNumber: {},
    inactiveStepNumber: {},
    activeStepDot: {
      backgroundColor: TossColors.success,
      borderColor: TossColors.success,
    },
    inactiveStepDot: {
      backgroundColor: TossColors.white,
      borderColor: TossColors.gray200,
    },
  },
  warning: {
    track: {
      backgroundColor: TossColors.gray100,
    },
    fill: {
      backgroundColor: TossColors.warning,
    },
    activeDot: {
      backgroundColor: TossColors.warning,
    },
    inactiveDot: {
      backgroundColor: TossColors.gray200,
    },
    stepNumbers: true,
    activeStepNumber: {},
    inactiveStepNumber: {},
    activeStepDot: {
      backgroundColor: TossColors.warning,
      borderColor: TossColors.warning,
    },
    inactiveStepDot: {
      backgroundColor: TossColors.white,
      borderColor: TossColors.gray200,
    },
  },
  primary: {
    track: {
      backgroundColor: TossColors.gray100,
    },
    fill: {
      backgroundColor: TossColors.primary,
    },
    activeDot: {
      backgroundColor: TossColors.primary,
    },
    inactiveDot: {
      backgroundColor: TossColors.gray200,
    },
    stepNumbers: true,
    activeStepNumber: {},
    inactiveStepNumber: {},
    activeStepDot: {
      backgroundColor: TossColors.primary,
      borderColor: TossColors.primary,
    },
    inactiveStepDot: {
      backgroundColor: TossColors.white,
      borderColor: TossColors.gray200,
    },
  },
};
