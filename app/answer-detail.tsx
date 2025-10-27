import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import { ServerQuestion } from '@/services/surveyService';

export default function AnswerDetailScreen() {
  const router = useRouter();
  const { date, questions } = useLocalSearchParams();
  const blurActiveElement = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = (document.activeElement as any);
      if (el && typeof el.blur === 'function') el.blur();
    }
  };
  
  let questionList: ServerQuestion[] = [];
  if (questions) {
    try {
      questionList = JSON.parse(questions as string) as ServerQuestion[];
    } catch (err) {
      console.warn('answer-detail: failed to parse questions param', err);
      questionList = [];
    }
  }

  const handleBack = () => {
    blurActiveElement();
    router.replace('/my-answers');
  };

  // 응답 내용을 표시하기 위한 유틸리티 함수
  const formatAnswer = (question: ServerQuestion): string => {
    const answer = question.responseAnswer;
    if (!answer) return '';

    switch (question.questionType) {
      case 'TEXT':
        return answer.answer || '';
      case 'SCALE':
        return String(answer.answer || '');
      case 'YES_NO':
        return answer.answer ? '예' : '아니오';
      case 'DATE':
        return answer.answer || '';
      case 'TIME':
        return answer.answer || '';
      case 'SINGLE_CHOICE':
        if (answer.answer === 'other') {
          return answer.otherText || '';
        }
        // options에서 label 찾기
        const selectedOption = question.options?.options?.find(
          (opt: any) => opt.value === answer.answer
        );
        return selectedOption?.label || answer.answer || '';
      case 'MULTIPLE_CHOICE':
        if (!Array.isArray(answer.answers)) return '';
        return answer.answers
          .map((ans: string) => {
            if (ans === 'other') {
              return answer.otherText || '';
            }
            const selectedOption = question.options?.options?.find(
              (opt: any) => opt.value === ans
            );
            return selectedOption?.label || ans;
          })
          .join(', ');
      default:
        return '';
    }
  };

  const renderAnswerItem = (question: ServerQuestion, index: number) => {
    return (
      <TossCard key={question.assignmentId} style={styles.answerCard}>
        <View style={styles.questionContainer}>
          <TossText variant="caption2" color="textTertiary" style={styles.questionNumber}>
            {index + 1}
          </TossText>
          <TossText variant="body1" color="textPrimary" style={styles.questionText}>
            {question.title}
          </TossText>
        </View>
        <View style={styles.answerContainer}>
          <TossText variant="body2" color="textSecondary" style={styles.answerText}>
            {formatAnswer(question)}
          </TossText>
        </View>
      </TossCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title={date as string}
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questionList.map((question, index) => renderAnswerItem(question, index))}
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
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  answerCard: {
    marginBottom: TossSpacing.md,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TossSpacing.sm,
    gap: TossSpacing.sm,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: TossSpacing.sm,
  },
  questionText: {
    fontWeight: '600',
  },
  answerContainer: {
    backgroundColor: TossColors.gray50,
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    borderRadius: TossSpacing.sm,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
}); 
