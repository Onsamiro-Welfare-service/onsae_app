import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

// Import inquiry service
import InquiryService, { UploadListItem } from '@/services/inquiryService';

export default function InquiryScreen() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 업로드 목록을 불러오는 함수
   * @param isRefresh 새로고침 여부
   */
  const loadUploads = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await InquiryService.getUploadList();

      if (response.success && response.uploads) {
        setUploads(response.uploads);
      } else {
        setError(response.message || '문의 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('문의 목록 로드 실패:', err);
      setError('문의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 화면 포커스 시 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      loadUploads();
    }, [loadUploads])
  );

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 문의 생성 화면으로 이동
   */
  const handleCreate = () => {
    router.push('/inquiry-create');
  };

  /**
   * 문의 상세 화면으로 이동
   */
  const handleItemPress = (uploadId: number) => {
    // @ts-ignore - expo-router 타입 문제로 인한 임시 처리
    router.push({
      pathname: '/inquiry-detail',
      params: { id: uploadId.toString() },
    });
  };

  /**
   * 날짜 포맷팅 함수
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      // 오늘인 경우 시간만 표시
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      // 한 주 이상인 경우 날짜 표시
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
  };

  /**
   * 파일 타입 아이콘 반환
   */
  const getFileTypeIcon = (fileType: string | null): string => {
    switch (fileType) {
      case 'IMAGE':
        return '🖼️';
      case 'AUDIO':
        return '🎵';
      case 'VIDEO':
        return '🎥';
      case 'DOCUMENT':
        return '📄';
      case 'TEXT':
        return '📝';
      default:
        return '📎';
    }
  };

  /**
   * 업로드 목록 항목 렌더링
   */
  const renderUploadItem = ({ item }: { item: UploadListItem }) => {
    const hasResponse = item.adminResponseDate !== null;

    return (
      <TossCard
        style={styles.uploadCard}
        onPress={() => handleItemPress(item.id)}
      >
        <View style={styles.uploadCardHeader}>
          <View style={styles.uploadCardLeft}>
            <Text style={styles.fileTypeIcon}>
              {getFileTypeIcon(item.firstFileType)}
            </Text>
            <View style={styles.uploadCardInfo}>
              <View style={styles.uploadCardTitleRow}>
                <Text 
                  style={styles.uploadCardTitle}
                  numberOfLines={1}
                >
                  {item.title || '(제목 없음)'}
                </Text>
                {hasResponse && (
                  <View style={styles.responseBadge}>
                    <TossText variant="caption3" color="white">
                      답변완료
                    </TossText>
                  </View>
                )}
              </View>
              {item.contentPreview && (
                <Text 
                  style={styles.uploadCardPreview}
                  numberOfLines={2}
                >
                  {item.contentPreview}
                </Text>
              )}
              <View style={styles.uploadCardMeta}>
                <TossText variant="caption3" color="textTertiary">
                  {item.fileCount}개 파일 · {formatDate(item.createdAt)}
                </TossText>
              </View>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </TossCard>
    );
  };

  /**
   * 빈 목록 렌더링
   */
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={TossColors.primary} />
          <TossText variant="body2" color="textSecondary" style={styles.emptyText}>
            문의 목록을 불러오는 중...
          </TossText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <TossText variant="body1" color="textSecondary" style={styles.emptyText}>
          아직 문의사항이 없습니다
        </TossText>
        <TossText variant="caption2" color="textTertiary" style={styles.emptySubText}>
          오른쪽 상단의 + 버튼을 눌러 문의를 작성해보세요
        </TossText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="문의사항"
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <TossText variant="caption2" color="textSecondary">
            {error}
          </TossText>
        </View>
      )}

      {/* 목록 */}
      <FlatList
        data={uploads}
        renderItem={renderUploadItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          uploads.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadUploads(true)}
            colors={[TossColors.primary]}
            tintColor={TossColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 작성 버튼 */}
      <View style={styles.buttonContainer}>
        <TossButton
          title="문의 작성하기"
          onPress={handleCreate}
          variant="primary"
          size="large"
          style={styles.createButton}
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
  errorContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingVertical: TossSpacing.sm,
    backgroundColor: TossColors.gray100,
  },
  listContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
    paddingBottom: 100, // 하단 버튼 공간 확보
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  uploadCard: {
    marginBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
  },
  uploadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: TossSpacing.sm,
  },
  uploadCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileTypeIcon: {
    fontSize: 32,
    marginRight: TossSpacing.md,
  },
  uploadCardInfo: {
    flex: 1,
  },
  uploadCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TossSpacing.xs,
  },
  uploadCardTitle: {
    flex: 1,
    marginRight: TossSpacing.xs,
    fontSize: 16,
    fontWeight: '500',
    color: TossColors.textPrimary,
  },
  uploadCardPreview: {
    fontSize: 14,
    fontWeight: '400',
    color: TossColors.textSecondary,
    marginBottom: TossSpacing.xs,
    lineHeight: 16,
  },
  responseBadge: {
    backgroundColor: TossColors.primary,
    paddingHorizontal: TossSpacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadCardMeta: {
    marginTop: TossSpacing.xs,
  },
  arrowIcon: {
    fontSize: 20,
    color: TossColors.textDisabled,
    marginLeft: TossSpacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: TossSpacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: TossSpacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: TossSpacing.xs,
  },
  emptySubText: {
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
    borderTopWidth: 1,
    borderTopColor: TossColors.gray200,
  },
  createButton: {
    width: '100%',
  },
});