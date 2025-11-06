import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import InquiryService from '@/services/inquiryService';

export default function InquiryCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 화면 포커스 시 상태 초기화
   */
  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setContent('');
      setSelectedImages([]);
    }, [])
  );

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 이미지 선택 핸들러
   * 갤러리에서 이미지를 선택합니다.
   */
  const handleImagePicker = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true, // 여러 이미지 선택 가능
      });

      if (!result.canceled && result.assets) {
        // 기존 이미지에 추가
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  /**
   * 이미지 삭제 핸들러
   * @param index 삭제할 이미지 인덱스
   */
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 문의 전송 핸들러
   * 서버에 문의사항을 전송합니다.
   */
  const handleSend = async () => {
    // 제목과 내용이 모두 비어있고 파일도 없는 경우
    if (!title.trim() && !content.trim() && selectedImages.length === 0) {
      Alert.alert('알림', '제목, 내용 또는 사진 중 하나는 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 파일 업로드 요청
      const response = await InquiryService.uploadFiles({
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        files: selectedImages,
      });

      if (response.success) {
        // 전송 완료 페이지로 이동
        router.replace('/inquiry-complete');
      } else {
        Alert.alert('오류', response.message || '문의 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('문의 전송 실패:', error);
      Alert.alert('오류', '문의 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const canSend = (title.trim().length > 0 || content.trim().length > 0 || selectedImages.length > 0) && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="문의사항 작성"
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 입력 카드 */}
        <TossCard style={styles.inputCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="제목 (선택사항)"
            placeholderTextColor={TossColors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            editable={!loading}
          />
          <View style={styles.characterCount}>
            <TossText variant="caption3" color="textTertiary">
              {title.length}/200
            </TossText>
          </View>
        </TossCard>

        {/* 텍스트 입력 카드 */}
        <TossCard style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="궁금한 것이 있으시면 자유롭게 적어주세요"
            placeholderTextColor={TossColors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={1000}
            editable={!loading}
          />
          <View style={styles.characterCount}>
            <TossText variant="caption3" color="textTertiary">
              {content.length}/1000
            </TossText>
          </View>
        </TossCard>

        {/* 사진 업로드 카드 */}
        <TossCard style={styles.uploadCard} padding="sm">
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleImagePicker}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.cameraIcon}>📷</Text>
            <TossText variant="body2" color="textSecondary" style={styles.uploadText}>
              사진을 추가하려면 터치하세요
            </TossText>
            <TossText variant="caption3" color="textTertiary" style={styles.uploadHint}>
              여러 장 선택 가능
            </TossText>
          </TouchableOpacity>

          {/* 선택된 이미지 목록 */}
          {selectedImages.length > 0 && (
            <View style={styles.imageList}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                    disabled={loading}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </TossCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 전송 버튼 */}
      <View style={styles.buttonContainer}>
        <TossButton
          title={loading ? "전송 중..." : "전송"}
          onPress={handleSend}
          variant="primary"
          size="large"
          disabled={!canSend}
          loading={loading}
          style={styles.sendButton}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  inputCard: {
    marginBottom: TossSpacing.lg,
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.md,
  },
  titleInput: {
    fontSize: 16,
    color: TossColors.textPrimary,
    fontWeight: '600',
    minHeight: 24,
  },
  textInput: {
    fontSize: 16,
    color: TossColors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: TossSpacing.sm,
  },
  uploadCard: {
    marginBottom: TossSpacing.lg,
    alignItems: 'center',
    paddingVertical: TossSpacing.xl,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: TossSpacing.md,
  },
  uploadText: {
    textAlign: 'center',
    marginBottom: TossSpacing.xs,
  },
  uploadHint: {
    textAlign: 'center',
  },
  imageList: {
    marginTop: TossSpacing.lg,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TossSpacing.md,
  },
  imageItem: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: TossSpacing.md,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: TossColors.error || '#FF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TossColors.white,
  },
  removeButtonText: {
    color: TossColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  buttonContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
    paddingTop: TossSpacing.md,
    borderTopWidth: 1,
    borderTopColor: TossColors.border || '#F0F0F0',
  },
  sendButton: {
    width: '100%',
  },
});
