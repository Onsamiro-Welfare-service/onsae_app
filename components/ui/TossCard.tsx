import { TossColors, TossRadius, TossSpacing } from '@/constants/toss-design-system';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface TossCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: keyof typeof TossSpacing;
}

export function TossCard({ 
  children, 
  style, 
  onPress,
  padding = 'lg' 
}: TossCardProps) {
  const containerStyle = [
    styles.container,
    style,
  ];

  const innerStyle = [
    styles.inner,
    { padding: TossSpacing[padding] },
  ];

  const content = (
    <View style={innerStyle}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: TossColors.white,
    borderRadius: TossRadius.xl,
    shadowColor: TossColors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inner: {
    borderRadius: TossRadius.xl,
    overflow: 'hidden',
  },
});
