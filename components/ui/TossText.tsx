import { TossColors, TossTypography } from '@/constants/toss-design-system';
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface TossTextProps {
  children: React.ReactNode;
  variant?: 'title1' | 'title2' | 'title3' | 'body1' | 'body2' | 'caption1' | 'caption2' | 'caption3';
  color?: keyof typeof TossColors;
  style?: TextStyle;
  align?: 'left' | 'center' | 'right';
  onPress?: () => void;
}

export function TossText({ 
  children, 
  variant = 'body2',
  color = 'textPrimary',
  style,
  align = 'left',
  onPress,
}: TossTextProps) {
  const textStyle = [
    styles.base,
    TossTypography[variant],
    { color: TossColors[color], textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} onPress={onPress}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
