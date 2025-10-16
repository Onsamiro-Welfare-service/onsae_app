import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View
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

// Import survey service
import SurveyService, { SurveyQuestion } from '@/services/surveyService';

export default function SurveyScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // 문진 질문 로드
  useEffect(() => {
    loadSurveyQuestions();
  }, []);

  const loadSurveyQuestions = async () => {
    try {
      setLoading(true);
      const response = await SurveyService.getSurveyQuestions();
      if (response.success && response.questions) {
        setQuestions(response.questions);
      }
    } catch (error) {
      console.error('문진 질문 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 화면에 포커스될 때마다 상태 초기화
  useFocusEffect(
    useCallback(() => {
      setCurrentQuestionIndex(0);
      setAnswers({});
    }, [])
  );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      const success = await SurveyService.saveSurveyAnswers(answers);
      if (success) {
        router.push('/complete');
      }
    } catch (error) {
      console.error('문진 완료 처리 실패:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">
            문진을 불러오는 중...
          </TossText>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader
          title="오늘의 문진"
          subtitle=""
          showBackButton={true}
          onBackPress={handleBack}
        />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">
            문진을 불러올 수 없습니다.
          </TossText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="오늘의 문진"
        subtitle={`${currentQuestionIndex + 1}/${questions.length}`}
        showBackButton={true}
        onBackPress={handleBack}
      />

      {/* 진행률 표시 */}
      <View style={styles.progressContainer}>
        <TossProgressBar
          progress={progress}
          variant="primary"
          size="large"
          animated={true}
        />
      </View>

      <ScrollView 
        style={styles.questionScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TossCard style={styles.card}>
          <TossText variant="title1" color="textPrimary" style={styles.questionTitle}>
            {currentQuestion.title}
          </TossText>
          
          {currentQuestion.subtitle && (
            <TossText variant="caption2" color="textTertiary" style={styles.subtitle}>
              {currentQuestion.subtitle}
            </TossText>
          )}

          <View style={styles.componentContainer}>
            {currentQuestion.type === 'emoji' && currentQuestion.options && (
              <TossEmojiSelector
                options={currentQuestion.options}
                selectedValue={answers[currentQuestion.id]}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                style={styles.emojiSelector}
              />
            )}

            {currentQuestion.type === 'slider' && (
              <TossSlider
                value={answers[currentQuestion.id] || currentQuestion.minValue || 0}
                minimumValue={currentQuestion.minValue || 0}
                maximumValue={currentQuestion.maxValue || 100}
                step={currentQuestion.step || 1}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                labelFormat={currentQuestion.labelFormat}
              />
            )}

            {currentQuestion.type === 'image' && currentQuestion.options && (
              <TossImgSelector
                options={currentQuestion.options}
                selectedValue={answers[currentQuestion.id]}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                style={styles.imageSelector}
              />
            )}
          </View>
        </TossCard>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <TossButton
          title={currentQuestionIndex === questions.length - 1 ? "완료" : "다음"}
          onPress={handleNext}
          variant="primary"
          size="medium"
          disabled={answers[currentQuestion.id] == null}
          style={styles.menuButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  progressContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
  },
  questionScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  questionTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  componentContainer: {
    alignItems: 'center',
    marginBottom: TossSpacing.xl,
  },
  emojiSelector: {
    width: '100%',
  },
  imageSelector: {
    width: '100%',
  },
  card: {
    marginHorizontal: TossSpacing.lg,
    marginBottom: TossSpacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
  },
  menuButton: {
    width: '100%',
  },
}); 
