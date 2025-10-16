import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

interface DailyAnswer {
  id: string;
  date: string;
  question: string;
  answer: string;
  type: 'emoji' | 'slider' | 'yesno' | 'image';
}

export default function AnswerDetailScreen() {
  const router = useRouter();
  const { date, answers } = useLocalSearchParams();
  
  const answerList: DailyAnswer[] = answers ? JSON.parse(answers as string) : [];

  const handleBack = () => {
    router.replace('/my-answers');
  };

  const renderAnswerItem = (answer: DailyAnswer, index: number) => (
    <TossCard key={answer.id} style={styles.answerCard}>
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <TossText variant="caption2" color="textTertiary" style={styles.questionNumber}>
            {index + 1}
          </TossText>
        </View>
        
        <TossText variant="body1" color="textPrimary" style={styles.questionText}>
          {answer.question}
        </TossText>
      </View>
      <View style={styles.answerContainer}>
        <TossText variant="body2" color="textSecondary" style={styles.answerText}>
          {answer.answer}
        </TossText>
      </View>
    </TossCard>
  );

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
        {answerList.map((answer, index) => renderAnswerItem(answer, index))}
        
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
  questionHeader: {
    
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
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