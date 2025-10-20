import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossDatePicker } from '@/components/ui/TossDatePicker';
import { TossEmojiSelector } from '@/components/ui/TossEmojiSelector';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossProgressBar } from '@/components/ui/TossProgressBar';
import { TossSlider } from '@/components/ui/TossSlider';
import { TossText } from '@/components/ui/TossText';
import { TossTimePicker } from '@/components/ui/TossTimePicker';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import { post } from '@/services/api';
import SurveyService, { ChoiceOption, ServerQuestion } from '@/services/surveyService';

export default function SurveyScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ServerQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({}); // key: assignmentId
  const [otherTexts, setOtherTexts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDevToolsConnected, setIsDevToolsConnected] = useState(false);
  
  // 날짜 선택 모달 상태
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDateQuestionId, setCurrentDateQuestionId] = useState<number | null>(null);
  
  // 시간 선택 모달 상태
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [currentTimeQuestionId, setCurrentTimeQuestionId] = useState<number | null>(null);

  useEffect(() => {
    // React DevTools 연결 상태 확인
    if (__DEV__ && typeof window !== 'undefined') {
      setIsDevToolsConnected(!!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__);
    }
  }, []);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const questionsData = await SurveyService.getSurveyQuestions();
        setQuestions(questionsData);
      } catch (e) {
        console.error('설문 질문 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const q = questions[current];
  const progress = useMemo(() => {
    return questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  }, [current, questions.length]);

  const setAnswer = useCallback((assignmentId: number, value: any) => {
    // React DevTools와의 충돌 방지를 위한 안전한 상태 업데이트
    if (isDevToolsConnected) {
      // DevTools가 연결된 경우 약간의 지연을 두어 충돌 방지
      setTimeout(() => {
        setAnswers(prev => ({ ...prev, [assignmentId]: value }));
      }, 0);
    } else {
      setAnswers(prev => ({ ...prev, [assignmentId]: value }));
    }
  }, [isDevToolsConnected]);

  const toggleMulti = useCallback((assignmentId: number, value: string) => {
    const prev: string[] = Array.isArray(answers[assignmentId]) ? answers[assignmentId] : [];
    if (prev.includes(value)) {
      setAnswer(assignmentId, prev.filter(v => v !== value));
    } else {
      setAnswer(assignmentId, [...prev, value]);
    }
  }, [answers, setAnswer]);

  const isAnswered = (question?: ServerQuestion): boolean => {
    if (!question) return false;
    const a = answers[question.assignmentId];
    switch (question.questionType) {
      case 'SINGLE_CHOICE':
        if (!a) return false;
        if (a === '__OTHER__') {
          const t = otherTexts[question.assignmentId];
          return !!t && t.trim().length > 0;
        }
        return true;
      case 'MULTIPLE_CHOICE':
        return Array.isArray(a) && a.length > 0;
      case 'TEXT':
        return typeof a === 'string' && a.trim().length > 0;
      case 'SCALE':
        return typeof a === 'number';
      case 'YES_NO':
        return typeof a === 'boolean';
      case 'DATE':
        return typeof a === 'string' && a.length >= 8;
      case 'TIME':
        return typeof a === 'string' && a.length >= 4;
      default:
        return false;
    }
  };

  const submitAnswers = async () => {
    try {
      setSubmitting(true);
      
      // 모든 질문의 응답을 API 형식으로 변환
      const responses = Object.entries(answers).map(([assignmentId, answer]) => {
        const question = questions.find(q => q.assignmentId === parseInt(assignmentId));
        if (!question) return null;

        const otherText = otherTexts[parseInt(assignmentId)] || null;
        
        // 질문 타입에 따라 응답 형식 결정
        let responseData;
        
        switch (question.questionType) {
          case 'SINGLE_CHOICE':
            responseData = {
              questionId: question.questionId,
              answer: answer === '__OTHER__' ? 'other' : answer,
              otherText: otherText,
              note: null
            };
            break;
            
          case 'MULTIPLE_CHOICE':
            // 배열에서 __OTHER__를 other로 변환
            const convertedAnswers = Array.isArray(answer) 
              ? answer.map(a => a === '__OTHER__' ? 'other' : a)
              : answer;
            responseData = {
              questionId: question.questionId,
              answers: convertedAnswers,
              otherText: otherText,
              note: null
            };
            break;
            
          case 'TEXT':
            responseData = {
              questionId: question.questionId,
              answer: answer,
              note: null
            };
            break;
            
          case 'SCALE':
            responseData = {
              questionId: question.questionId,
              answer: answer,
              note: null
            };
            break;
            
          case 'YES_NO':
            responseData = {
              questionId: question.questionId,
              answer: answer, // "yes" 또는 "no"
              note: null
            };
            break;
            
          case 'DATE':
            responseData = {
              questionId: question.questionId,
              answer: answer, // "2024-01-15" 형식
              note: null
            };
            break;
            
          case 'TIME':
            responseData = {
              questionId: question.questionId,
              answer: answer, // "14:30" 형식
              note: null
            };
            break;
            
          default:
            responseData = {
              questionId: question.questionId,
              answer: answer,
              note: null
            };
        }

        return {
          assignmentId: parseInt(assignmentId),
          answer: responseData
        };
      }).filter(response => response !== null);

      console.log('제출할 응답들:', responses);

      // 각 응답을 개별적으로 제출
      for (const response of responses) {
        console.log('제출할 응답:', response);
        await post('/api/user/questions/responses', response);
      }

      console.log('설문 응답 제출 완료');
      router.push('/complete');
    } catch (error) {
      console.error('설문 응답 제출 실패:', error);
      
      Alert.alert(
        '제출 실패',
        '설문 응답 제출에 실패했습니다. 다시 시도해주세요.',
        [
          {
            text: '확인',
            style: 'default',
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      // 마지막 질문에서 완료 버튼을 누르면 응답 제출
      submitAnswers();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderChoice = useCallback((question: ServerQuestion, multiple: boolean) => {
    try {
      const opts: ChoiceOption[] = question.options?.options || [];
      const selected = answers[question.assignmentId];
      const assignmentId = question.assignmentId;
      
      return (
        <View>
          {opts.map((opt: ChoiceOption, index: number) => {
            const active = multiple
              ? Array.isArray(selected) && selected.includes(opt.value)
              : selected === opt.value;
            return (
              <TouchableOpacity
                key={`${assignmentId}-${opt.value}-${index}`}
                style={[styles.optionItem, active && styles.optionItemActive]}
                onPress={() => {
                  try {
                    if (multiple) {
                      toggleMulti(assignmentId, opt.value);
                    } else {
                      setAnswer(assignmentId, opt.value);
                    }
                  } catch (error) {
                    console.error('Choice selection error:', error);
                  }
                }}
              >
                <TossText variant="body1" color={active ? 'white' : 'textPrimary'}>
                  {opt.label}
                </TossText>
              </TouchableOpacity>
            );
          })}
          {question.allowOtherOption && (
            <View style={styles.otherContainer} key={`${assignmentId}-other-container`}>
              <TouchableOpacity
                key={`${assignmentId}-other-button`}
                style={[styles.optionItem, selected === '__OTHER__' && styles.optionItemActive]}
                onPress={() => {
                  try {
                    setAnswer(assignmentId, '__OTHER__');
                  } catch (error) {
                    console.error('Other option selection error:', error);
                  }
                }}
              >
                <TossText variant="body1" color={selected === '__OTHER__' ? 'white' : 'textPrimary'}>
                  {question.otherOptionLabel || '기타'}
                </TossText>
              </TouchableOpacity>
              {selected === '__OTHER__' && (
                <TextInput
                  key={`${assignmentId}-other-input`}
                  style={styles.textInput}
                  placeholder={question.otherOptionPlaceholder || '기타 내용을 입력하세요'}
                  value={otherTexts[assignmentId] || ''}
                  onChangeText={(t) => {
                    try {
                      setOtherTexts(prev => ({ ...prev, [assignmentId]: t }));
                    } catch (error) {
                      console.error('Other text input error:', error);
                    }
                  }}
                />
              )}
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('Render choice error:', error);
      return (
        <View>
          <TossText variant="body1" color="textSecondary">
            선택 옵션을 불러올 수 없습니다.
          </TossText>
        </View>
      );
    }
  }, [answers, otherTexts, toggleMulti, setAnswer]);

  const renderQuestionBody = (question: ServerQuestion) => {
    switch (question.questionType) {
      case 'SINGLE_CHOICE':
        return renderChoice(question, false);
      case 'MULTIPLE_CHOICE':
        return renderChoice(question, true);
      case 'TEXT': {
        const maxLength = question.options?.maxLength ?? 500;
        return (
          <TextInput
            style={[styles.textInput, { textAlign: 'left' }]}
            placeholder={question.content || '내용을 입력하세요'}
            value={answers[question.assignmentId] || ''}
            onChangeText={(t) => setAnswer(question.assignmentId, t)}
            maxLength={maxLength}
            multiline
          />
        );
      }
      case 'SCALE': {
        const min = question.options?.min ?? question.options?.minValue ?? 0;
        const max = question.options?.max ?? question.options?.maxValue ?? 5;
        const value = typeof answers[question.assignmentId] === 'number' ? answers[question.assignmentId] : min;
        return (
          <TossSlider
            value={value}
            minimumValue={min}
            maximumValue={max}
            step={1}
            onValueChange={(v) => setAnswer(question.assignmentId, v)}
          />
        );
      }
      case 'YES_NO': {
        const sel = answers[question.assignmentId];
        const yesNoOptions = [
          { emoji: '✅', label: '예', value: 'true' },
          { emoji: '❌', label: '아니오', value: 'false' }
        ];
        
        return (
          <TossEmojiSelector
            options={yesNoOptions}
            selectedValue={sel === true ? 'true' : sel === false ? 'false' : undefined}
            onValueChange={(value) => setAnswer(question.assignmentId, value === 'true')}
          />
        );
      }
      case 'DATE': {
        const defaultToday = question.options?.defaultToday === true;
        const current = (answers[question.assignmentId] as string) || (defaultToday ? new Date().toISOString().slice(0, 10) : '');
        
        const formatDate = (dateString: string) => {
          if (!dateString) return '날짜를 선택해주세요';
          const date = new Date(dateString);
          return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          });
        };

        const handleDatePress = () => {
          // 현재 선택된 날짜가 있으면 그 날짜로 설정, 없으면 오늘 날짜로 설정
          const initialDate = current ? new Date(current) : new Date();
          setSelectedDate(initialDate);
          setCurrentDateQuestionId(question.assignmentId);
          setDateModalVisible(true);
        };

        return (
          <TouchableOpacity
            style={styles.dateInput}
            onPress={handleDatePress}
            activeOpacity={0.7}
          >
            <TossText variant="body1" color={current ? 'textPrimary' : 'textTertiary'}>
              {formatDate(current)}
            </TossText>
            <TossText variant="caption1" color="textTertiary" style={{ marginTop: 4 }}>
              📅 탭하여 날짜 선택
            </TossText>
          </TouchableOpacity>
        );
      }
      case 'TIME': {
        const current = (answers[question.assignmentId] as string) || '';
        
        const formatTime = (timeString: string) => {
          if (!timeString) return '시간을 선택해주세요';
          
          // HH:MM 형식의 시간을 한국어로 포맷팅
          const [hour, minute] = timeString.split(':').map(Number);
          const period = hour >= 12 ? '오후' : '오전';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          
          return `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        };

        const handleTimePress = () => {
          // 현재 선택된 시간이 있으면 파싱, 없으면 기본값(09:00)으로 설정
          let initialTime = new Date();
          initialTime.setHours(9, 0, 0, 0); // 기본값 09:00
          
          if (current) {
            const [hour, minute] = current.split(':').map(Number);
            if (!isNaN(hour) && !isNaN(minute)) {
              initialTime.setHours(hour, minute, 0, 0);
            }
          }
          setSelectedTime(initialTime);
          setCurrentTimeQuestionId(question.assignmentId);
          setTimeModalVisible(true);
        };

        return (
          <TouchableOpacity
            style={styles.timeInput}
            onPress={handleTimePress}
            activeOpacity={0.7}
          >
            <TossText variant="body1" color={current ? 'textPrimary' : 'textTertiary'}>
              {formatTime(current)}
            </TossText>
            <TossText variant="caption1" color="textTertiary" style={{ marginTop: 4 }}>
              🕐 탭하여 시간 선택
            </TossText>
          </TouchableOpacity>
        );
      }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">문진을 불러오는 중...</TossText>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={TossColors.background} />
        <TossHeader title="오늘의 문진" subtitle="" showBackButton onBackPress={handleBack} />
        <View style={styles.centerContent}>
          <TossText variant="body1" color="textSecondary">문진을 불러오지 못했습니다.</TossText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={TossColors.background} />

      <TossHeader title="오늘의 문진" subtitle="" showBackButton onBackPress={handleBack} />

      <View style={styles.progressContainer}>
        <TossProgressBar progress={progress} variant="primary" size="large" animated />
      </View>

      <ScrollView style={styles.questionScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TossCard style={styles.card}>
          <TossText variant="title1" color="textPrimary" style={styles.questionTitle}>
            {q.title}
          </TossText>
          {!!q.content && (
            <TossText variant="caption2" color="textTertiary" style={styles.subtitle}>
              {q.content}
            </TossText>
          )}
          <View style={styles.componentContainer}>{renderQuestionBody(q)}</View>
        </TossCard>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TossButton
          title={current === questions.length - 1 ? (submitting ? '제출 중...' : '완료') : '다음'}
          onPress={handleNext}
          variant="primary"
          size="medium"
          disabled={!isAnswered(q) || submitting}
          loading={submitting}
          style={styles.menuButton}
        />
      </View>
      
      {/* 날짜 선택 모달 */}
      <TossDatePicker
        visible={dateModalVisible}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onClose={() => setDateModalVisible(false)}
        onConfirm={() => {
          if (currentDateQuestionId !== null) {
            setAnswer(currentDateQuestionId, selectedDate.toISOString().slice(0, 10));
          }
          setDateModalVisible(false);
        }}
      />
      
      {/* 시간 선택 모달 */}
      <TossTimePicker
        visible={timeModalVisible}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={(time) => {
          if (currentTimeQuestionId !== null) {
            const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            setAnswer(currentTimeQuestionId, timeString);
          }
          setTimeModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossColors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: TossSpacing.lg,
  },
  progressContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
  },
  questionScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TossSpacing.lg,
    paddingTop: TossSpacing.lg,
  },
  questionTitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: TossSpacing.xl,
  },
  componentContainer: {
    alignItems: 'stretch',
    marginBottom: TossSpacing.xl,
    gap: 8,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: TossColors.white,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    marginBottom: 8,
  },
  optionItemActive: {
    backgroundColor: TossColors.primary,
    borderColor: TossColors.primary,
  },
  otherContainer: {
    marginTop: TossSpacing.sm,
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
  dateInput: {
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    paddingVertical: TossSpacing.lg,
    paddingHorizontal: TossSpacing.lg,
    backgroundColor: TossColors.gray50,
    borderRadius: TossSpacing.md,
    borderWidth: 1,
    borderColor: TossColors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginBottom: TossSpacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: TossSpacing.lg,
    paddingBottom: TossSpacing.md,
  },
  menuButton: {
    width: '100%',
  },
});

