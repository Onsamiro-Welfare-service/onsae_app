import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossButton } from '@/components/ui/TossButton';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

export default function InquiryCompleteScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <View style={styles.content}>
        {/* 완료 이모지 */}
        <View style={styles.emojiContainer}>
          <Text style={styles.checkEmoji}>✅</Text>
        </View>

        {/* 완료 제목 */}
        <TossText variant="title1" color="textPrimary" style={styles.completionTitle}>
          문의 전송 완료!
        </TossText>

        {/* 안내 메시지 */}
        <TossText variant="body2" color="textSecondary" style={styles.message}>
          문의사항이 성공적으로 전송되었습니다.{'\n'}빠른 시일 내에 답변드리겠습니다.
        </TossText>

        {/* 홈으로 돌아가기 버튼 */}
        <View style={styles.buttonContainer}>
          <TossButton
            title="홈으로 돌아가기"
            onPress={handleGoHome}
            variant="primary"
            size="large"
            style={styles.homeButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: 100, // 버튼 공간 확보
  },
  emojiContainer: {
    marginBottom: TossSpacing.xl,
  },
  checkEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  completionTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.lg,
    fontSize: 28,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
    paddingTop: TossSpacing.md,
  },
  homeButton: {
    width: '100%',
  },
}); 