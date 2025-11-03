import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossAlert, showTossAlert } from '@/components/ui/TossAlert';
import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossDatePicker } from '@/components/ui/TossDatePicker';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import InstitutionService, { Institution } from '@/services/institutionService';
import UserService from '@/services/userService';

export default function SignupScreen() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 기관 목록 로드
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const data = await InstitutionService.getInstitutions();
        setInstitutions(data);
        if (data.length > 0) {
          setSelectedInstitution(data[0].id);
        }
      } catch (error) {
        console.error('기관 목록 로드 실패:', error);
      }
    };
    loadInstitutions();
  }, []);

  const handleSignup = async () => {
    // 유효성 검사
    if (!selectedInstitution) {
      showTossAlert({
        title: '알림',
        message: '기관을 선택해주세요.',
        confirmText: '확인',
      });
      return;
    }
    if (!username.trim()) {
      showTossAlert({
        title: '알림',
        message: '아이디를 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }
    if (!password.trim()) {
      showTossAlert({
        title: '알림',
        message: '비밀번호를 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }
    if (password !== confirmPassword) {
      showTossAlert({
        title: '알림',
        message: '비밀번호가 일치하지 않습니다.',
        confirmText: '확인',
      });
      return;
    }
    if (!name.trim()) {
      showTossAlert({
        title: '알림',
        message: '이름을 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }
    if (!phone.trim()) {
      showTossAlert({
        title: '알림',
        message: '전화번호를 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }
    if (!birthDate) {
      showTossAlert({
        title: '알림',
        message: '생년월일을 선택해주세요.',
        confirmText: '확인',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await UserService.signup({
        institutionId: selectedInstitution,
        username: username.trim(),
        password: password.trim(),
        name: name.trim(),
        phone: phone.trim(),
        birthDate: birthDate.toISOString().split('T')[0],
      });
      console.log('result',result);
      if (result.success) {
        showTossAlert({
          title: '회원가입 성공',
          message: result.message || '회원가입이 완료되었습니다.',
          confirmText: '확인',
          onConfirm: () => {
            router.push('/login');
          },
        });
      } else {
        showTossAlert({
          title: '회원가입 실패',
          message: result.message || '회원가입에 실패했습니다.',
          confirmText: '확인',
        });
      }
    } catch (error) {
      showTossAlert({
        title: '오류',
        message: '회원가입 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSignup =
    selectedInstitution !== null &&
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    !isLoading;

  const selectedInstitutionName = institutions.find(i => i.id === selectedInstitution)?.name || '기관 선택';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />
      <TossHeader
        title="회원가입"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 회원가입 카드 */}
        <TossCard style={styles.card}>
          {/* 기관 선택 */}
          <View style={styles.pickerContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              기관 *
            </TossText>
            <TouchableOpacity
              onPress={() => setShowInstitutionPicker(true)}
              disabled={isLoading || institutions.length === 0}
            >
              <View style={styles.pickerInput}>
                <TossText variant="body1" color={selectedInstitution ? 'textPrimary' : 'textTertiary'}>
                  {selectedInstitutionName}
                </TossText>
              </View>
            </TouchableOpacity>
            {showInstitutionPicker && (
              <View style={styles.pickerModal}>
                <TossText variant="title3" color="textPrimary" style={styles.pickerModalTitle}>
                  기관 선택
                </TossText>
                <ScrollView style={styles.pickerModalScroll} nestedScrollEnabled>
                  {institutions.map((institution) => (
                    <TouchableOpacity
                      key={institution.id}
                      onPress={() => {
                        setSelectedInstitution(institution.id);
                        setShowInstitutionPicker(false);
                      }}
                      style={[
                        styles.pickerOption,
                        selectedInstitution === institution.id && styles.pickerOptionSelected,
                      ]}
                    >
                      <TossText
                        variant="body1"
                        color={selectedInstitution === institution.id ? 'white' : 'textPrimary'}
                      >
                        {institution.name}
                      </TossText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setShowInstitutionPicker(false)}
                  style={styles.pickerCloseButton}
                >
                  <TossText variant="body1" color="textPrimary">닫기</TossText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              아이디 *
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="아이디를 입력하세요"
              placeholderTextColor={TossColors.textTertiary}
              value={username}
              onChangeText={setUsername}
              maxLength={50}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              비밀번호 *
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

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              비밀번호 확인 *
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor={TossColors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              maxLength={50}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              이름 *
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="이름을 입력하세요"
              placeholderTextColor={TossColors.textTertiary}
              value={name}
              onChangeText={setName}
              maxLength={20}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              전화번호 *
            </TossText>
            <TextInput
              style={styles.textInput}
              placeholder="010-1234-5678"
              placeholderTextColor={TossColors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={20}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TossText variant="body1" color="textPrimary" style={styles.inputLabel}>
              생년월일 *
            </TossText>
            <TossDatePicker
              visible={showDatePicker}
              selectedDate={birthDate}
              onDateChange={setBirthDate}
              onClose={() => setShowDatePicker(false)}
              onConfirm={() => setShowDatePicker(false)}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <View style={styles.dateInput}>
                <TossText variant="body1" color={birthDate ? 'textPrimary' : 'textTertiary'}>
                  {birthDate ? birthDate.toISOString().split('T')[0] : 'YYYY-MM-DD'}
                </TossText>
              </View>
            </TouchableOpacity>
          </View>

          {/* 회원가입 버튼 */}
          <View style={styles.buttonContainer}>
            <TossButton
              title={isLoading ? "가입 중..." : "회원가입"}
              onPress={handleSignup}
              variant="primary"
              size="large"
              disabled={!canSignup}
              loading={isLoading}
              style={styles.signupButton}
            />
          </View>
        </TossCard>
      </ScrollView>
      <TossAlert />
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
    paddingVertical: TossSpacing.lg,
  },
  card: {
    paddingVertical: TossSpacing.md,
  },
  inputContainer: {
    marginBottom: TossSpacing.xl,
  },
  pickerContainer: {
    marginBottom: TossSpacing.xl,
    position: 'relative',
    zIndex: 10,
  },
  inputLabel: {
    marginBottom: TossSpacing.md,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 16,
    color: TossColors.textPrimary,
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
  },
  buttonContainer: {
    width: '100%',
    marginTop: TossSpacing.md,
  },
  signupButton: {
    width: '100%',
  },
  dateInput: {
    fontSize: 16,
    color: TossColors.textPrimary,
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
  },
  pickerInput: {
    fontSize: 16,
    color: TossColors.textPrimary,
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
  },
  pickerModal: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: TossColors.white,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    padding: TossSpacing.md,
    marginTop: TossSpacing.sm,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerModalScroll: {
    maxHeight: 200,
  },
  pickerModalTitle: {
    marginBottom: TossSpacing.md,
    textAlign: 'center',
  },
  pickerOption: {
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    borderRadius: TossSpacing.sm,
    marginBottom: TossSpacing.xs,
  },
  pickerOptionSelected: {
    backgroundColor: TossColors.primary,
  },
  pickerCloseButton: {
    paddingVertical: TossSpacing.md,
    paddingHorizontal: TossSpacing.lg,
    borderRadius: TossSpacing.sm,
    backgroundColor: TossColors.gray100,
    marginTop: TossSpacing.md,
    alignItems: 'center',
  },
});

