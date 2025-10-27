import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our Toss components
import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';

// Import user service
import UserService from '@/services/userService';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await UserService.login(username.trim(), password.trim());
      
      if (result.success && result.user) {
        // 사용자 정보 저장
        await UserService.saveUserInfo(result.user);
        router.replace('/');
      } else {
        Alert.alert('로그인 실패', result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canLogin = username.trim().length > 0 && password.trim().length > 0 && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      
      <View style={styles.content}>
        {/* 로고/이모지 */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>

        {/* 제목 */}
        <TossText variant="title1" color="textPrimary" style={styles.title}>
          안전한 하루
        </TossText>

        {/* 부제목 */}
        <TossText variant="body2" color="textSecondary" style={styles.subtitle}>
          아이디와 비밀번호를 입력해주세요
        </TossText>

        {/* 로그인 카드 */}
        <TossCard style={styles.loginCard}>
          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              아이디
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="아이디를 입력하세요"
              placeholderTextColor={TossColors.textTertiary}
              value={username}
              onChangeText={setUsername}
              maxLength={50}
              autoFocus={true}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              비밀번호
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={TossColors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              maxLength={50}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          {/* 로그인 버튼 */}
          <View style={styles.buttonContainer}>
            <TossButton
              title={isLoading ? "로그인 중..." : "로그인"}
              onPress={handleLogin}
              variant="primary"
              size="large"
              disabled={!canLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
          </View>
        </TossCard>

          {/* 도움말 및 회원가입 버튼 */}
        <View style={styles.footerContainer}>
          <TossText variant="caption2" color="textTertiary" style={styles.helpText}>
            계정이 없으신가요?
          </TossText>
          <TossButton
            title="회원가입"
            onPress={() => router.push('/signup')}
            variant="outline"
            size="medium"
            style={styles.signupButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  logoContainer: {
    marginBottom: TossSpacing.xl,
  },
  logoEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: TossSpacing.sm,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
    lineHeight: 22,
  },
  loginCard: {
    width: '100%',
    paddingVertical: TossSpacing.md,
    marginBottom: TossSpacing.lg,
  },
  inputContainer: {
    marginBottom: TossSpacing.xl,
  },
  inputLabel: {
    marginBottom: TossSpacing.md,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 18,
    color: TossColors.textPrimary,
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    textAlign: 'center',
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    width: '100%',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: TossSpacing.lg,
  },
  helpText: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: TossSpacing.md,
  },
  signupButton: {
    width: '100%',
    maxWidth: 300,
  },
}); 