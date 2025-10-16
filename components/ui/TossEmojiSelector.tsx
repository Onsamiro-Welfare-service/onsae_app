import { TossColors, TossRadius } from '@/constants/toss-design-system';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface EmojiOption {
  emoji: string;
  label: string;
  value: string;
}

interface TossEmojiSelectorProps {
  options: EmojiOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export function TossEmojiSelector({
  options,
  selectedValue,
  onValueChange,
  style,
}: TossEmojiSelectorProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.emoji,
              isSelected && styles.selectedEmoji,
            ]}>
              {option.emoji}
            </Text>
            <Text style={[
              styles.label,
              isSelected && styles.selectedLabel,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: TossRadius.xl,
    backgroundColor: TossColors.white,
    borderWidth: 1,
    borderColor: TossColors.gray100,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: TossColors.primaryLight,
    borderColor: TossColors.primary,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  selectedEmoji: {
    opacity: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: TossColors.textTertiary,
  },
  selectedLabel: {
    color: TossColors.primary,
  },
});
