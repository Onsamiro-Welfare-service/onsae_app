import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import { UserResponse } from '@/services/surveyService';

export default function AnswerDetailScreen() {
  const router = useRouter();
  const { date, responses } = useLocalSearchParams();
  const blurActiveElement = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = (document.activeElement as any);
      if (el && typeof el.blur === 'function') el.blur();
    }
  };
  
  let responseList: UserResponse[] = [];
  if (responses) {
    try {
      responseList = JSON.parse(responses as string) as UserResponse[];
    } catch (err) {
      console.warn('answer-detail: failed to parse responses param', err);
      responseList = [];
    }
  }

  const handleBack = () => {
    blurActiveElement();
    // router.replace('/my-answers');
    router.back();
  };

  // 응답 내용을 표시하기 위한 유틸리티 함수
  const formatAnswer = (response: UserResponse): string => {
    const responseData = response.responseData;
    if (!responseData) return '';

    switch (response.questionType) {
      case 'TEXT':
        return String(responseData.answer || '');
      case 'SCALE':
        return String(responseData.answer || '');
      case 'YES_NO':
        return responseData.answer ? '예' : '아니오';
      case 'DATE':
        return String(responseData.answer || '');
      case 'TIME':
        return String(responseData.answer || '');
      case 'SINGLE_CHOICE':
        if (responseData.answer === 'other') {
          return responseData.otherText || '';
        }
        return String(responseData.answer || '');
      case 'MULTIPLE_CHOICE':
        if (responseData.answers && Array.isArray(responseData.answers)) {
          return responseData.answers
            .map((ans: string) => {
              if (ans === 'other') {
                return responseData.otherText || '';
              }
              return ans;
            })
            .join(', ');
        }
        return String(responseData.answer || '');
      default:
        return '';
    }
  };

  const renderAnswerItem = (response: UserResponse, index: number) => {
    return (
      <TossCard key={response.responseId} style={styles.answerCard}>
        <View style={styles.questionContainer}>
          <TossText variant="caption2" color="textTertiary" style={styles.questionNumber}>
            {index + 1}
          </TossText>
          <TossText variant="body1" color="textPrimary" style={styles.questionText}>
            {response.questionTitle}
          </TossText>
        </View>
        <View style={styles.answerContainer}>
          <TossText variant="body2" color="textSecondary" style={styles.answerText}>
            {formatAnswer(response)}
          </TossText>
        </View>
      </TossCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <TossHeader
        title={date as string}
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {responseList.map((response, index) => renderAnswerItem(response, index))}
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
