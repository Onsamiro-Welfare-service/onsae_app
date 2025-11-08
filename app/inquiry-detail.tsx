import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import InquiryService, { UploadDetailResponse } from '@/services/inquiryService';

export default function InquiryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [upload, setUpload] = useState<UploadDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 업로드 상세 정보 로드
   */
  useEffect(() => {
    const loadUploadDetail = async () => {
      if (!params.id) {
        setError('문의 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const uploadId = parseInt(params.id, 10);
        if (isNaN(uploadId)) {
          setError('유효하지 않은 문의 ID입니다.');
          return;
        }

        const response = await InquiryService.getUploadDetail(uploadId);

        if (response.success && response.upload) {
          setUpload(response.upload);
        } else {
          setError(response.message || '문의사항을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('문의 상세 로드 실패:', err);
        setError('문의사항을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUploadDetail();
  }, [params.id]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 날짜 포맷팅 함수
   */
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader
          title="문의 상세"
          showBackButton={true}
          onBackPress={handleBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TossColors.primary} />
          <TossText variant="body2" color="textSecondary" style={styles.loadingText}>
            불러오는 중...
          </TossText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !upload) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader
          title="문의 상세"
          showBackButton={true}
          onBackPress={handleBack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <TossText variant="body1" color="textSecondary" style={styles.errorText}>
            {error || '문의사항을 불러올 수 없습니다.'}
          </TossText>
          <TossButton
            title="돌아가기"
            onPress={handleBack}
            variant="primary"
            size="medium"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="문의 상세"
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 및 내용 카드 */}
        <TossCard style={styles.contentCard}>
          {upload.title && (
            <TossText variant="title3" color="textPrimary" style={styles.title}>
              {upload.title}
            </TossText>
          )}
          {upload.content && (
            <TossText variant="body2" color="textSecondary" style={styles.content}>
              {upload.content}
            </TossText>
          )}
          
          {/* 이미지 파일 표시 */}
          {upload.files && upload.files.filter(file => file.fileType === 'IMAGE').length > 0 && (
            <View style={styles.imageContainer}>
              {upload.files
                .filter(file => file.fileType === 'IMAGE')
                .map((file) => (
                  <Image
                    key={file.id}
                    source={{ uri: InquiryService.getFileUrl(file.id) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
            </View>
          )}
          
          <View style={styles.meta}>
            <TossText variant="caption3" color="textTertiary">
              {formatDateTime(upload.createdAt)}
            </TossText>
            {upload.adminRead && (
              <View style={styles.readBadge}>
                <TossText variant="caption3" color="textSecondary">
                  읽음
                </TossText>
              </View>
            )}
          </View>
        </TossCard>

        {/* 답변 카드 */}
        {upload.adminResponse && (
          <TossCard style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <TossText variant="title3" color="textPrimary" style={styles.responseTitle}>
                관리자 답변
              </TossText>
              {upload.adminResponseDate && (
                <TossText variant="caption3" color="textTertiary">
                  {formatDateTime(upload.adminResponseDate)}
                </TossText>
              )}
            </View>
            <TossText variant="body2" color="textPrimary" style={styles.responseContent}>
              {upload.adminResponse}
            </TossText>
            {upload.adminName && (
              <TossText variant="caption2" color="textSecondary" style={styles.adminName}>
                {upload.adminName}
              </TossText>
            )}
          </TossCard>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: TossSpacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: TossSpacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  backButton: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  contentCard: {
    marginBottom: TossSpacing.lg,
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.md,
  },
  title: {
    marginBottom: TossSpacing.md,
    fontWeight: '600',
  },
  content: {
    marginBottom: TossSpacing.md,
    lineHeight: 22,
  },
  imageContainer: {
    marginTop: TossSpacing.md,
    marginBottom: TossSpacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: TossSpacing.md,
    marginBottom: TossSpacing.md,
    backgroundColor: TossColors.gray100,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: TossSpacing.sm,
  },
  readBadge: {
    backgroundColor: TossColors.background,
    paddingHorizontal: TossSpacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  responseCard: {
    marginBottom: TossSpacing.lg,
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.md,
    backgroundColor: TossColors.primaryLight,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TossSpacing.md,
  },
  responseTitle: {
    fontWeight: '600',
  },
  responseContent: {
    marginBottom: TossSpacing.sm,
    lineHeight: 22,
  },
  adminName: {
    marginTop: TossSpacing.xs,
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
});
