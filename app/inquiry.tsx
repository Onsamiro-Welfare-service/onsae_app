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

export default function InquiryScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setMessage('');
      setSelectedImage(null);
    }, [])
  );

  const handleBack = () => {
    router.back();
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('알림', '문의 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await InquiryService.sendInquiry(message.trim(), selectedImage || undefined);
      
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

  const canSend = message.trim().length > 0 && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      {/* 상단 헤더 */}
      <TossHeader
        title="문의사항 보내기"
        subtitle=""
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 사진 업로드 카드 */}
        <TossCard style={styles.uploadCard} padding="sm">
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleImagePicker}
            activeOpacity={0.7}
            disabled={loading}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <TossText variant="body2" color="textSecondary" style={styles.uploadText}>
                  사진을 추가하려면 터치하세요
                </TossText>
              </>
            )}
          </TouchableOpacity>
        </TossCard>

        {/* 텍스트 입력 카드 */}
        <TossCard style={styles.textInputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="궁금한 것이 있으시면 자유롭게 적어주세요"
            placeholderTextColor={TossColors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!loading}
          />
          <View style={styles.characterCount}>
            <TossText variant="caption3" color="textTertiary">
              {message.length}/500
            </TossText>
          </View>
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
  },
  selectedImage: {
    width: 400,
    minHeight: 150,
    resizeMode: 'contain',
    borderRadius: TossSpacing.md,
    marginBottom: TossSpacing.md,
  },
  textInputCard: {
    marginBottom: TossSpacing.lg,
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.md,
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
  bottomSpacing: {
    height: TossSpacing.xxl,
  },
  buttonContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
    backgroundColor: TossColors.white,
    paddingTop: TossSpacing.md,
  },
  sendButton: {
    width: '100%',
  },
}); 