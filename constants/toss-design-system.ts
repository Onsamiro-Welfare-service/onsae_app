export const TossColors = {
  // 브랜드 색상
  primary: '#3380ff',
  primaryLight: '#f2f7ff',
  primaryDark: '#2569e6',
  
  // 중성 색상
  background: '#f7f7fa',
  white: '#ffffff',
  
  // 텍스트 색상
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#cccccc',
  
  // 포인트 색상
  success: '#33cc66',
  warning: '#ff9500',
  danger: '#ff3b30',
  info: '#3399ff',
  
  // 회색 톤
  gray50: '#f9f9f9',
  gray100: '#f2f2f7',
  gray200: '#e5e5e7',
  gray300: '#d1d1d6',
  gray400: '#c7c7cc',
  gray500: '#aeaeb2',
  gray600: '#8e8e93',
  gray700: '#48484a',
  gray800: '#3a3a3c',
  gray900: '#1c1c1e',
};

export const TossSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TossRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 28,
  full: 9999,
};

export const TossTypography = {
  // 제목
  title1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 29,
    fontFamily: 'Inter',
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  title3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  
  // 본문
  body1: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  body2: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  
  // 설명
  caption1: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 17,
    fontFamily: 'Inter',
  },
  caption2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 17,
    fontFamily: 'Inter',
  },
  caption3: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 14,
    fontFamily: 'Inter',
  },
};
