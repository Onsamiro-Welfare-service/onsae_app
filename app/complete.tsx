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
import { TossCard } from '@/components/ui/TossCard';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

export default function CompleteScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <View style={styles.content}>
        {/* 축하 이모지 */}
        <View style={styles.emojiContainer}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </View>

        {/* 완료 제목 */}
        <TossText variant="title1" color="textPrimary" style={styles.completionTitle}>
          문진 완료!
        </TossText>

        {/* 감사 메시지 */}
        <TossText variant="body2" color="textSecondary" style={styles.thankYouMessage}>
          오늘도 수고하셨어요!{'\n'}문진에 참여해주셔서 감사합니다.
        </TossText>

        {/* 리워드 카드 */}
        <TossCard style={styles.rewardCard}>
          <View style={styles.rewardContent}>
            <TossText variant="title3" color="textPrimary" style={styles.rewardTitle}>
              🪙 +10 코인 획득!
            </TossText>
            <TossText variant="caption2" color="textTertiary" style={styles.rewardDescription}>
              방 꾸미기에 사용할 수 있어요
            </TossText>
          </View>
        </TossCard>

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
  celebrationEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  completionTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.lg,
    fontSize: 32,
    fontWeight: '700',
  },
  thankYouMessage: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
    lineHeight: 22,
  },
  rewardCard: {
    width: '100%',
    marginBottom: TossSpacing.xl,
    alignItems: 'center',
    paddingVertical: TossSpacing.lg,
  },
  rewardContent: {
    alignItems: 'center',
  },
  rewardTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.sm,
    fontSize: 20,
    fontWeight: '600',
  },
  rewardDescription: {
    textAlign: 'center',
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