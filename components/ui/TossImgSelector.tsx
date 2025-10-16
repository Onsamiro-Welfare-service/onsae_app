import { TossColors, TossRadius, TossSpacing } from '@/constants/toss-design-system';
import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { TossText } from './TossText';

interface ImgOption {
  imageUri: string;
  label: string;
  value: string;
}

interface TossImgSelectorProps {
  options: ImgOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
  imageSize?: number;
  itemsPerRow?: number; // 한 줄에 들어갈 아이템 수 (기본값: 2)
}

export function TossImgSelector({
  options,
  selectedValue,
  onValueChange,
  style,
  imageSize = 90,
  itemsPerRow = 2,
}: TossImgSelectorProps) {
  // 행별로 나누는 함수
  const getRows = () => {
    const rows = [];
    for (let i = 0; i < options.length; i += itemsPerRow) {
      rows.push(options.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const rows = getRows();

  return (
    <View style={[styles.container, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((option, optionIndex) => {
            const isSelected = selectedValue === option.value;
            
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => onValueChange(option.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.imageContainer,
                  { borderRadius: TossRadius.sm },
                  isSelected && styles.selectedImageContainer,
                ]}>
                  <Image
                    source={{ uri: option.imageUri }}
                    style={[
                      styles.image,
                      { 
                        width: imageSize, 
                        height: imageSize,
                        borderRadius: TossRadius.sm,
                      }
                    ]}
                    resizeMode="cover"
                  />
                </View>
                
                <TossText 
                  variant="caption1"
                  color={isSelected ? "textPrimary" : "textTertiary"}
                  style={styles.label}
                >
                  {option.label}
                </TossText>
              </TouchableOpacity>
            );
          })}
          
          {/* 마지막 행에 빈 공간 추가 또는 중심 정렬 처리 */}
          {row.length < itemsPerRow && (
            <View style={styles.flexFix} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 컨테이너는 이제 세로 방향의 행들을 포함
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: TossSpacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.md,
    borderRadius: TossRadius.xl,
    backgroundColor: TossColors.white,
    borderWidth: 1,
    borderColor: TossColors.gray100,
    marginHorizontal: TossSpacing.xs,
  },
  selectedOption: {
    backgroundColor: TossColors.primaryLight,
    borderColor: TossColors.primary,
  },
  imageContainer: {
    marginBottom: TossSpacing.sm,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    borderWidth: 2,
    borderColor: TossColors.primary,
  },
  image: {
    backgroundColor: TossColors.gray100,
  },
  label: {
    textAlign: 'center',
    fontWeight: '500',
  },
  // 마지막 행에 빈 공간이나 중심 정렬 처리용
  flexFix: {
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.md,
    marginHorizontal: TossSpacing.xs,
    flex: 1,
  },
});