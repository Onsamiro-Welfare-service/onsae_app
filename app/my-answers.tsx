import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import SurveyService, { UserResponse } from '@/services/surveyService';
import UserService from '@/services/userService';

interface AnswerGroup {
  date: string;
  responses: UserResponse[];
}

export default function MyAnswersScreen() {
  const router = useRouter();
  const [answerGroups, setAnswerGroups] = useState<AnswerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const blurActiveElement = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = (document.activeElement as any);
      if (el && typeof el.blur === 'function') el.blur();
    }
  };

  useEffect(() => {
    loadAnswerGroups();
  }, []);

  const loadAnswerGroups = async () => {
    try {
      setLoading(true);
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        console.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const userId = parseInt(currentUser.id, 10);
      if (isNaN(userId)) {
        console.error('유효하지 않은 사용자 ID:', currentUser.id);
        return;
      }

      const responseData = await SurveyService.getUserResponses(userId);
      
      // 날짜별로 그룹화
      const groupedByDate = responseData.responses.reduce((acc, response) => {
        if (!response.submittedAt) return acc;
        const date = response.submittedAt.split('T')[0];
        if (!acc[date]) acc[date] = [] as UserResponse[];
        acc[date].push(response);
        return acc;
      }, {} as Record<string, UserResponse[]>);

      // 날짜순 정렬 (최신순)
      const groups = Object.entries(groupedByDate)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, responses]) => ({ date, responses }));

      setAnswerGroups(groups);
    } catch (error) {
      console.error('Failed to load answer groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    blurActiveElement();
    router.back();
  };

  const handleDatePress = (answerGroup: AnswerGroup) => {
    blurActiveElement();
    router.push({
      pathname: '/answer-detail',
      params: { 
        date: answerGroup.date,
        responses: JSON.stringify(answerGroup.responses)
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
          <TossText variant="caption2" color="textTertiary" style={styles.answerCount}>
            {item.responses.length}개 답변
          </TossText>
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
      <TossHeader
        title="내 답변"
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
  dateText: {
    flex: 1,
    fontWeight: '600',
  },
  answerCount: {
    fontSize: 12,
    paddingHorizontal: TossSpacing.md,
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