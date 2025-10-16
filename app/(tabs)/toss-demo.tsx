import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossEmojiSelector } from '@/components/ui/TossEmojiSelector';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossImgSelector } from '@/components/ui/TossImgSelector';
import { TossProgressBar } from '@/components/ui/TossProgressBar';
import { TossSlider } from '@/components/ui/TossSlider';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

export default function TossDemoScreen() {
  const [selectedEmoji, setSelectedEmoji] = useState('neutral');
  const [currentProgress, setCurrentProgress] = useState(60);
  const [currentStep, setCurrentStep] = useState(3);
  const [sliderValue, setSliderValue] = useState(50);
  const [selectedImg, setSelectedImg] = useState('profile1');
  const handleButtonPress = (message: string) => {
    Alert.alert('알림', message);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    console.log('Slider value:', value);
  };

  const emojiOptions = [
    { emoji: '😢', label: '안좋음', value: 'sad' },
    { emoji: '😐', label: '보통', value: 'neutral' },
    { emoji: '😊', label: '좋음', value: 'happy' },
  ];

  const imgOptions = [
    { 
      imageUri: 'https://images.unsplash.com/photo-1494790108755-2616b612b4e2?w=100&h=100&fit=crop&crop=face', 
      label: '프로필1', 
      value: 'profile1' 
    },
    { 
      imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 
      label: '프로필2', 
      value: 'profile2' 
    },
    { 
      imageUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', 
      label: '프로필3', 
      value: 'profile3' 
    },
  ];
  
  const handleProgressChange = () => {
    const newProgress = Math.floor(Math.random() * 100);
    setCurrentProgress(newProgress);
  };

  const handleStepChange = () => {
    const newStep = Math.floor(Math.random() * 5) + 1;
    setCurrentStep(newStep);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      <TossHeader
        title="토스 디자인 시스템"
        subtitle="재사용 가능한 컴포넌트들"
        leftIcon="🏠"
        rightIcon="🔔"
        onLeftPress={() => handleButtonPress('홈 버튼 클릭!')}
        onRightPress={() => handleButtonPress('알림 버튼 클릭!')}
        badge={3}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button Header Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            뒤로가기 헤더 예시
          </TossText>
          
          <View style={styles.headerPreview}>
            <TossHeader
              title="오늘의 문진"
              subtitle="1/5"
              showBackButton={true}
              onBackPress={() => handleButtonPress('뒤로가기!')}
              style={styles.previewHeader}
            />
          </View>
        </TossCard>

        {/* Basic Header Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            기본 헤더 예시
          </TossText>
          
          <View style={styles.headerPreview}>
            <TossHeader
              title="알림"
              rightIcon="✏️"
              onRightPress={() => handleButtonPress('편집 버튼!')}
              style={styles.previewHeader}
            />
          </View>
        </TossCard>

        {/* Main Card */}
        <TossCard style={styles.mainCard}>
          <TossText variant="body1" color="textSecondary" style={styles.cardText}>
            오늘도 안전하고 건강한 하루 보내세요! 😊
          </TossText>
          <View style={styles.buttonContainer}>
            <TossButton
              title="오늘의 문진 시작하기"
              onPress={() => handleButtonPress('문진을 시작합니다!')}
              variant="primary"
              size="medium"
              style={styles.fullWidthButton}
            />
          </View>
        </TossCard>

        {/* Buttons Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            버튼 컴포넌트
          </TossText>
          
          <View style={styles.buttonGroup}>
            <TossButton
              title="Primary"
              onPress={() => handleButtonPress('Primary 버튼 클릭!')}
              variant="primary"
              size="medium"
            />
            <TossButton
              title="Secondary"
              onPress={() => handleButtonPress('Secondary 버튼 클릭!')}
              variant="secondary"
              size="medium"
            />
          </View>
          
          <View style={styles.buttonGroup}>
            <TossButton
              title="Outline"
              onPress={() => handleButtonPress('Outline 버튼 클릭!')}
              variant="outline"
              size="medium"
            />
            <TossButton
              title="Disabled"
              disabled={true}
              variant="primary"
              size="medium"
            />
          </View>
          <View style={styles.buttonContainer}>
            <TossButton
              title="다음"
              onPress={() => handleButtonPress('다음')}
              variant="primary"
              size="medium"
              style={styles.fullWidthButton}
            />
          </View>
        </TossCard>

        {/* Typography Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            타이포그래피
          </TossText>
          
          <View style={styles.typographySection}>
            <TossText variant="title1" color="textPrimary">
              제목 1 (Title1)
            </TossText>
            <TossText variant="title2" color="textPrimary">
              제목 2 (Title2)
            </TossText>
            <TossText variant="title3" color="textPrimary">
              제목 3 (Title3)
            </TossText>
            <TossText variant="body1" color="textPrimary">
              본문 1 강조 (Body1)
            </TossText>
            <TossText variant="body2" color="textPrimary">
              본문 2 일반 (Body2)
            </TossText>
            <TossText variant="caption1" color="textSecondary">
              설명 1 강조 (Caption1)
            </TossText>
            <TossText variant="caption2" color="textSecondary">
              설명 2 일반 (Caption2)
            </TossText>
          </View>
        </TossCard>

        {/* Emoji Selector Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            감정 선택기
          </TossText>
          <TossText variant="caption2" color="textSecondary" style={styles.demoDescription}>
            오늘 기분은 어떠세요?
          </TossText>
          
          <TossEmojiSelector
            options={emojiOptions}
            selectedValue={selectedEmoji}
            onValueChange={setSelectedEmoji}
            style={styles.emojiSelector}
          />
        </TossCard>

        {/* Lifestyle Cards Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            기능 카드들
          </TossText>
          
          <View style={styles.lifestyleCards}>
            {/* 문의하기 카드 */}
            <TossCard 
              style={styles.lifestyleCard}
              onPress={() => handleButtonPress('문의하기 카드 클릭!')}
            >
              <View style={styles.lifestyleContent}>
                <Text style={styles.lifestyleIcon}>🏃‍♂️</Text>
                <View style={styles.lifestyleTextContainer}>
                  <TossText variant="body1" color="textPrimary">
                    문의 하기
                  </TossText>
                  <TossText variant="caption2" color="textSecondary">
                    언제든 빠르게 복지관에 문의해보세요
                  </TossText>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TossCard>

            {/* 나의 방 카드 */}
            <TossCard 
              style={styles.lifestyleCard}
              onPress={() => handleButtonPress('나의 방 카드 클릭!')}
            >
              <View style={styles.lifestyleContent}>
                <Text style={styles.lifestyleIcon}>💚</Text>
                <View style={styles.lifestyleTextContainer}>
                  <TossText variant="body1" color="textPrimary">
                    나의 방
                  </TossText>
                  <TossText variant="caption2" color="textSecondary">
                    나만의 방을 꾸며보세요
                  </TossText>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TossCard>
          </View>
        </TossCard>

        {/* Progress Bar Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            프로그래스바 컴포넌트
          </TossText>
          
          {/* Basic Progress */}
          <View style={styles.progressSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.progressLabel}>
              기본 진행률: {currentProgress}%
            </TossText>
            <TossProgressBar
              progress={currentProgress}
              variant="primary"
              size="large"
              style={styles.progressBar}
            />
            <TossButton
              title="진행률 변경"
              onPress={handleProgressChange}
              variant="secondary"
              size="small"
              style={styles.demoButton}
            />
          </View>

          {/* Step Progress */}
          <View style={styles.progressSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.progressLabel}>
              단계별 진행: {currentStep}/5
            </TossText>
            <TossProgressBar
              progress={currentProgress}
              currentStep={currentStep}
              totalSteps={5}
              variant="success"
              size="large"
              showLabels={true}
              style={styles.progressBar}
            />
            <TossButton
              title="단계 변경"
              onPress={handleStepChange}
              variant="secondary"
              size="small"
              style={styles.demoButton}
            />
          </View>

          {/* Different Variants */}
          <View style={styles.progressSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.progressLabel}>
              다양한 스타일
            </TossText>
            
            <View style={styles.variantGroup}>
              <View style={styles.variantItem}>
                <TossText variant="caption3" color="textTertiary">Primary</TossText>
                <TossProgressBar progress={75} variant="primary" size="small" />
              </View>
              
              <View style={styles.variantItem}>
                <TossText variant="caption3" color="textTertiary">Success</TossText>
                <TossProgressBar progress={80} variant="success" size="small" />
              </View>
              
              <View style={styles.variantItem}>
                <TossText variant="caption3" color="textTertiary">Warning</TossText>
                <TossProgressBar progress={45} variant="warning" size="small" />
              </View>
            </View>
          </View>
        </TossCard>

        {/* Slider Demo */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            슬라이더 컴포넌트
          </TossText>
          
          {/* 기본 슬라이더 */}
          <View style={styles.sliderSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.sliderLabel}>
              기본 슬라이더: {sliderValue}점
            </TossText>
            <TossSlider
              value={sliderValue}
              minimumValue={0}
              maximumValue={100}
              onValueChange={handleSliderChange}
              style={styles.slider}
            />
            <TossText variant="caption2" color="textTertiary" style={styles.sliderDescription}>
              몸 상태를 0점(아주 안좋음)부터 100점(아주 좋음)으로 표시해주세요
            </TossText>
          </View>

          {/* 비활성화된 슬라이더 */}
          <View style={styles.sliderSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.sliderLabel}>
              비활성화된 슬라이더
            </TossText>
            <TossSlider
              value={75}
              minimumValue={0}
              maximumValue={100}
              disabled={true}
              style={styles.slider}
            />
          </View>

          {/* 커스텀 범위 슬라이더 */}
          <View style={styles.sliderSection}>
            <TossText variant="caption1" color="textSecondary" style={styles.sliderLabel}>
              커스텀 범위 슬라이더
            </TossText>
            <TossSlider
              value={30}
              minimumValue={10}
              maximumValue={50}
              step={5}
              labelFormat={(value) => `${value}살`}
              style={styles.slider}
            />
            <TossText variant="caption2" color="textTertiary" style={styles.sliderDescription}>
              나이를 선택해주세요 (5살 단위)
            </TossText>
          </View>
        </TossCard>

        {/* 슬라이더 문진 카드 데모 */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            슬라이더 문진 예시
          </TossText>
          
          <View style={styles.questionCard}>
            <TossText variant="title1" color="textPrimary" style={styles.questionTitle}>
              오늘 몸 상태는 어떠세요?
            </TossText>
            <TossText variant="caption2" color="textTertiary" style={styles.questionSubtitle}>
              (0: 아주 안좋음 ~ 100: 아주 좋음)
            </TossText>
            
            <View style={styles.sliderContainer}>
              <TossSlider
                value={sliderValue}
                minimumValue={0}
                maximumValue={100}
                onValueChange={handleSliderChange}
                style={styles.questionSlider}
              />
            </View>
            
            <TossButton
              title="다음"
              variant="primary"
              size="medium"
              onPress={() => handleButtonPress('문진을 계속합니다!')}
              style={styles.nextButton}
            />
          </View>
        </TossCard>

        {/* 이미지 선택기 데모 */}
        <TossCard style={styles.demoCard}>
          <TossText variant="title3" color="textPrimary" style={styles.cardTitle}>
            이미지 선택기 컴포넌트
          </TossText>
          <TossText variant="caption2" color="textSecondary" style={styles.demoDescription}>
            프로필 이미지를 선택해주세요
          </TossText>
          
          <TossImgSelector
            options={imgOptions}
            selectedValue={selectedImg}
            onValueChange={setSelectedImg}
            style={styles.imgSelector}
            imageSize={90}
          />
        </TossCard>

        <View style={styles.bottomSpacing} />
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: TossSpacing.md,
  },
  headerPreview: {
    backgroundColor: TossColors.white,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: TossSpacing.sm,
  },
  previewHeader: {
    backgroundColor: TossColors.white,
    borderBottomWidth: 0,
    paddingVertical: TossSpacing.sm,
  },
  header: {
    paddingHorizontal: TossSpacing.lg,
    paddingVertical: TossSpacing.lg,
  },
  headerSubtext: {
    marginTop: 4,
  },
  mainCard: {
    marginHorizontal: TossSpacing.lg,
    alignItems: 'center',
    paddingBottom: 40,
  },
  cardText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  fullWidthButton: {
    width: '100%',
  },
  demoCard: {
    marginHorizontal: TossSpacing.lg,
    marginBottom: TossSpacing.lg,
  },
  cardTitle: {
    marginBottom: TossSpacing.md,
  },
  demoDescription: {
    marginBottom: TossSpacing.lg,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: TossSpacing.md,
    gap: TossSpacing.md,
  },
  typographySection: {
    gap: TossSpacing.sm,
  },
  emojiSelector: {
    marginTop: TossSpacing.md,
  },
  lifestyleCards: {
    gap: TossSpacing.md,
  },
  lifestyleCard: {
    backgroundColor: TossColors.white,
  },
  lifestyleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lifestyleIcon: {
    fontSize: 32,
    marginRight: TossSpacing.md,
  },
  lifestyleTextContainer: {
    flex: 1,
  },
  arrow: {
    fontSize: 20,
    color: TossColors.textDisabled,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  progressSection: {
    marginBottom: TossSpacing.lg,
  },
  progressLabel: {
    marginBottom: TossSpacing.sm,
  },
  progressBar: {
    marginBottom: TossSpacing.sm,
  },
  demoButton: {
    alignSelf: 'flex-start',
  },
  variantGroup: {
    gap: TossSpacing.sm,
  },
  variantItem: {
    gap: TossSpacing.xs,
  },   
  sliderSection: {
    marginBottom: TossSpacing.lg,
    alignItems: 'center',
  },
  sliderLabel: {
    marginBottom: TossSpacing.sm,
    textAlign: 'center',
  },
  sliderDescription: {
    marginTop: TossSpacing.sm,
    textAlign: 'center',
  },
  slider: {
    marginVertical: TossSpacing.sm,
  },
  questionCard: {
    alignItems: 'center',
    paddingVertical: TossSpacing.xl,
  },
  questionTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.sm,
  },
  questionSubtitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: TossSpacing.xl,
  },
  questionSlider: {
    backgroundColor: TossColors.white,
  },
  nextButton: {
    width: 295,
  },
  imgSelector: {
    marginTop: TossSpacing.md,
  },

});
