import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

// Import survey service
import SurveyService from '@/services/surveyService';

interface DailyAnswer {
  id: string;
  date: string;
  question: string;
  answer: string;
  type: 'emoji' | 'slider' | 'yesno' | 'image';
}

interface AnswerGroup {
  date: string;
  answers: DailyAnswer[];
}

export default function MyAnswersScreen() {
  const router = useRouter();
  const [answerGroups, setAnswerGroups] = useState<AnswerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnswerGroups();
  }, []);

  const loadAnswerGroups = async () => {
    try {
      setLoading(true);
      const groups = await SurveyService.getAnswerGroups();
      setAnswerGroups(groups);
    } catch (error) {
      console.error('답변 그룹 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDatePress = (answerGroup: AnswerGroup) => {
    // 모달로 상세 답변 보기
    router.push({
      pathname: '/answer-detail',
      params: { 
        date: answerGroup.date,
        answers: JSON.stringify(answerGroup.answers)
      }
    });
  };

  const renderAnswerGroup = ({ item }: { item: AnswerGroup }) => (
    <TouchableOpacity onPress={() => handleDatePress(item)}>
      <TossCard style={styles.dateCard}>
        <View style={styles.dateContainer}>
          <TossText variant="title3" color="textPrimary" style={styles.dateText}>
              {item.date}
          </TossText>
          <View style={styles.dateHeader}>
            <TossText variant="caption2" color="textTertiary" style={styles.answerCount}>
              {item.answers.length}개 답변
            </TossText>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TossCard>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📝</Text>
      <TossText variant="title3" color="textPrimary" style={styles.emptyTitle}>
        아직 답변이 없어요
      </TossText>
      <TossText variant="body2" color="textSecondary" style={styles.emptyDescription}>
        문진에 참여하시면{'\n'}과거 답변을 확인할 수 있어요
      </TossText>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader
          title="내 답변"
          subtitle=""
          showBackButton={true}
          onBackPress={handleBack}
        />
        <View style={styles.emptyContainer}>
          <TossText variant="body1" color="textSecondary">
            답변을 불러오는 중...
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
        title="내 답변"
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      {answerGroups.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={answerGroups}
          renderItem={renderAnswerGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  listContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  dateCard: {
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.md,
    flex: 1,
    marginBottom: TossSpacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHeader: { 
    paddingHorizontal: TossSpacing.md,
  },
  dateText: {
    flex: 1,
    fontWeight: '600',
  },
  answerCount: {
    fontSize: 12,
  },
  previewContainer: {
    marginBottom: TossSpacing.sm,
  },
  previewItem: {
    marginBottom: TossSpacing.sm,
  },
  previewQuestion: {
    marginBottom: TossSpacing.xs,
  },
  previewAnswer: {
    fontWeight: '500',
  },
  moreText: {
    textAlign: 'center',
    marginTop: TossSpacing.sm,
    fontStyle: 'italic',
  },
  arrowContainer: {
    alignItems: 'flex-end',
  },
  arrow: {
    fontSize: 20,
    color: TossColors.textDisabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: TossSpacing.lg,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.md,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
}); 