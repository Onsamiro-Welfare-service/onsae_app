import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { TossText } from './TossText';

interface TossHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  showBackButton?: boolean;
  onBackPress?: () => void;
  badge?: string | number;
}

export function TossHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  showBackButton = false,
  onBackPress,
  badge,
}: TossHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            {/* 이모지 아이콘 사용 */}
            <TossText style={styles.backIcon}>←</TossText>
          </TouchableOpacity>
        ) : leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            <TossText style={styles.leftIcon}>{leftIcon}</TossText>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <TossText 
          variant="title3" 
          color="textPrimary" 
          align="center"
          style={styles.title}
        >
          {title}
        </TossText>
        {subtitle && (
          <TossText 
            variant="caption2" 
            color="textSecondary" 
            align="center"
            style={styles.subtitle}
          >
            {subtitle}
          </TossText>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            <View style={styles.rightIconContainer}>
              <TossText style={styles.rightIcon}>{rightIcon}</TossText>
              {badge && (
                <View style={styles.badge}>
                  <TossText variant="caption3" color="white" align="center">
                    {badge}
                  </TossText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
    paddingVertical: TossSpacing.md,
    backgroundColor: TossColors.white,
    borderBottomWidth: 1,
    borderBottomColor: TossColors.gray100,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  iconButton: {
    padding: 4,
  },
  leftIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
  },
  rightIconContainer: {
    position: 'relative',
  },
  rightIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: TossColors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  placeholder: {
    width: 40,
    height: 32,
  },
});
