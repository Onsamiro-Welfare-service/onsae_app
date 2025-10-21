
import { TossColors, TossRadius, TossTypography } from '@/constants/toss-design-system';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

interface TossButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function TossButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: TossButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[size],
    variantStyles[variant],
    disabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variantTextStyles[variant],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : TossColors.primary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: TossRadius.round,
  },
  
  // 크기별 스타일
  xsmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 24,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    minHeight: 64,
  },
  
  // 텍스트 크기
  text: {
    fontFamily: TossTypography.body1.fontFamily,
    fontWeight: TossTypography.body1.fontWeight,
  },
  xsmallText: {
    fontSize: 12,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: TossColors.primary,
  },
  secondary: {
    backgroundColor: TossColors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: TossColors.primary,
  },
});

const variantTextStyles = StyleSheet.create({
  primary: {
    color: TossColors.white,
  },
  secondary: {
    color: TossColors.primary,
  },
  outline: {
    color: TossColors.primary,
  },
});