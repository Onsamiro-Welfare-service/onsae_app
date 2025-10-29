import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import service
import UserService from '@/services/userService';

// Import our Toss components
import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import SurveyService from '@/services/surveyService';

export default function HomeScreen() {
  const router = useRouter();
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 문진 완료 여부 확인
  useEffect(() => {
    checkSurveyStatus();
  }, []);

  const checkSurveyStatus = async () => {
    try {
      const completed = await SurveyService.isTodaySurveyCompleted();
      // const completed = false;
      setIsSurveyCompleted(completed);
    } catch (error) {
      console.error('문진 상태 확인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    UserService.logout();
    router.replace('/login');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSurvey = () => {
    if (!isSurveyCompleted) {
      router.push('/survey');
    }
  };

  const functionalCards = [
    {
      icon: '🏃‍♂️',
      title: '문의 하기',
      description: '언제든 빠르게 복지관에 문의해보세요',
      onPress: () => {},
      disabled: true,
    },
    // {
    //   icon: '💚',
    //   title: '나의 방',
    //   description: '나만의 방을 꾸며보세요',
    //   onPress: () => handleButtonPress('나의 방 카드 클릭!'),
    // },
    {
      icon: '🧠',
      title: '내 답변',
      description: '과거에 내가 답했던 답변을 확인해 보세요',
      onPress: () => router.push('/my-answers'),
    },
    {
      icon: '🔔',
      title: '알람',
      description: '알람을 설정해보세요',
      onPress: () => router.push('/alarm'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="온새미로"
        showBackButton={false}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 메인 카드 */}
        <TossCard style={styles.mainCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardText}>
            오늘도 안전하고 건강한 하루 보내세요! 😊
          </TossText>
          
          <View style={styles.iconContainer}>
            <Text style={styles.noteIcon}>📋</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TossButton
              title={isSurveyCompleted ? "오늘의 문진은 완료되었습니다" : "오늘의 문진 시작하기"}
              onPress={handleSurvey}
              variant={isSurveyCompleted ? "secondary" : "primary"}
              size="medium"
              disabled={isSurveyCompleted}
              style={styles.primaryButton}
            />
          </View>
        </TossCard>

        {/* 기능 카드들 */}
        {functionalCards.map((card, index) => {
          const cardStyles = card.disabled 
            ? [styles.functionalCard, styles.disabledCard] as any
            : styles.functionalCard;
          const iconStyles = card.disabled 
            ? [styles.cardIcon, styles.disabledText] as any
            : styles.cardIcon;
          const titleStyles = card.disabled 
            ? [styles.cardTitle, styles.disabledText] as any
            : styles.cardTitle;
          
          return (
            <TossCard 
              key={index}
              style={cardStyles}
              onPress={card.disabled ? undefined : card.onPress}
            >
              <View style={styles.cardContent}>
                <Text style={iconStyles}>{card.icon}</Text>
                <View style={styles.cardTextContainer}>
                  <TossText variant="body1" color="textPrimary" style={titleStyles}>
                    {card.title}
                  </TossText>
                  <TossText variant="caption2" color="textSecondary" style={styles.cardDescription}>
                    {card.description}
                  </TossText>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TossCard>
          );
        })}

        <View style={styles.bottomSpacing} />
        
        <View style={styles.logoutContainer}>
          <TossText variant="caption2" color="textSecondary" style={styles.logoutText} onPress={handleLogout}>
            로그아웃
          </TossText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  header: {
    backgroundColor: TossColors.white,
    borderBottomWidth: 0,
    paddingHorizontal: TossSpacing.lg,
    paddingVertical: TossSpacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: TossSpacing.lg,
  },
  mainCard: {
    marginHorizontal: TossSpacing.lg,
    marginBottom: TossSpacing.lg,
    alignItems: 'center',
    paddingVertical: TossSpacing.xl,
  },
  cardText: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: TossSpacing.xl,
  },
  noteIcon: {
    fontSize: 60,
  },
  buttonContainer: {
    width: 'auto',
  },
  primaryButton: {
    width: '100%',
  },
  functionalCard: {
    marginHorizontal: TossSpacing.lg,
    marginBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: TossSpacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: TossSpacing.xs,
  },
  cardDescription: {
    lineHeight: 17,
  },
  arrowIcon: {
    fontSize: 20,
    color: TossColors.textDisabled,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  logoutContainer: {
    marginHorizontal: TossSpacing.lg,
    marginBottom: TossSpacing.md,
  },
  logoutText: {
    textAlign: 'right',
  },
  disabledCard: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
