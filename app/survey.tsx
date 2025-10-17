import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TossButton } from '@/components/ui/TossButton';
import { TossCard } from '@/components/ui/TossCard';
import { TossHeader } from '@/components/ui/TossHeader';
import { TossProgressBar } from '@/components/ui/TossProgressBar';
import { TossSlider } from '@/components/ui/TossSlider';
import { TossText } from '@/components/ui/TossText';
import { TossColors, TossSpacing } from '@/constants/toss-design-system';
import api from '@/services/api';

type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TEXT'
  | 'SCALE'
  | 'YES_NO'
  | 'DATE'
  | 'TIME';

interface ChoiceOption {
  label: string;
  value: string;
}

interface ServerQuestion {
  assignmentId: number;
  questionId: number;
  title: string;
  content: string;
  questionType: QuestionType;
  categoryId: number;
  categoryName: string;
  options: any | null;
  allowOtherOption: boolean;
  otherOptionLabel: string | null;
  otherOptionPlaceholder: string | null;
  isRequired: boolean;
  priority: number;
  assignmentSource: string;
  sourceId: number;
  sourceName: string;
  isCompleted: boolean;
  responseId: number | null;
  responseAnswer: any;
  responseSubmittedAt: string | null;
  assignedAt: string;
}

export default function SurveyScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ServerQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({}); // key: assignmentId
  const [otherTexts, setOtherTexts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDevToolsConnected, setIsDevToolsConnected] = useState(false);

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
        const data = await api.get<ServerQuestion[]>('/api/user/questions');
        const sorted = [...data].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
        setQuestions(sorted);
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

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      router.push('/complete');
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
        return (
          <View style={styles.yesNoRow}>
            <TouchableOpacity
              style={[styles.optionItem, sel === true && styles.optionItemActive]}
              onPress={() => setAnswer(question.assignmentId, true)}
            >
              <TossText variant="body1" color={sel === true ? 'white' : 'textPrimary'}>예</TossText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, sel === false && styles.optionItemActive]}
              onPress={() => setAnswer(question.assignmentId, false)}
            >
              <TossText variant="body1" color={sel === false ? 'white' : 'textPrimary'}>아니오</TossText>
            </TouchableOpacity>
          </View>
        );
      }
      case 'DATE': {
        const defaultToday = question.options?.defaultToday === true;
        const current = (answers[question.assignmentId] as string) || (defaultToday ? new Date().toISOString().slice(0, 10) : '');
        return (
          <TextInput
            style={styles.textInput}
            placeholder={question.content || 'YYYY-MM-DD'}
            value={current}
            onChangeText={(t) => setAnswer(question.assignmentId, t)}
          />
        );
      }
      case 'TIME': {
        const current = (answers[question.assignmentId] as string) || '';
        return (
          <TextInput
            style={styles.textInput}
            placeholder={question.content || 'HH:mm'}
            value={current}
            onChangeText={(t) => setAnswer(question.assignmentId, t)}
          />
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
          title={current === questions.length - 1 ? '완료' : '다음'}
          onPress={handleNext}
          variant="primary"
          size="medium"
          disabled={!isAnswered(q)}
          style={styles.menuButton}
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
  yesNoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    marginHorizontal: TossSpacing.lg,
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

