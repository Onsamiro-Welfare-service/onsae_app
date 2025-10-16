import AsyncStorage from '@react-native-async-storage/async-storage';

// 문진 타입 정의
export type SurveyType = 'emoji' | 'slider' | 'yesno' | 'image';

export interface SurveyQuestion {
  id: string;
  type: SurveyType;
  title: string;
  subtitle?: string;
  options?: any[];
  minValue?: number;
  maxValue?: number;
  step?: number;
  labelFormat?: (value: number) => string;
}

export interface SurveyAnswer {
  questionId: string;
  answer: any;
  timestamp: number;
}

export interface DailySurvey {
  id: string;
  date: string;
  answers: SurveyAnswer[];
  completed: boolean;
}

export interface SurveyResponse {
  success: boolean;
  questions?: SurveyQuestion[];
  message?: string;
}

class SurveyService {
  // AsyncStorage 키
  private static readonly SURVEY_QUESTIONS_KEY = '@survey_questions';
  private static readonly DAILY_SURVEYS_KEY = '@daily_surveys';
  private static readonly CURRENT_SURVEY_KEY = '@current_survey';

  // 더미 문진 질문 데이터
  private static dummyQuestions: SurveyQuestion[] = [
    {
      id: '1',
      type: 'emoji',
      title: '오늘 기분은 어떠세요?',
      options: [
        { emoji: '😢', label: '매우 안좋음', value: 'very_bad' },
        { emoji: '😐', label: '보통', value: 'normal' }, 
        { emoji: '😊', label: '좋음', value: 'happy' },
      ],
    },
    {
      id: '2',
      type: 'slider',
      title: '오늘 몸 상태는 어떠세요?',
      subtitle: '(0: 매우 안좋음 ~ 100: 매우 좋음)',
      minValue: 0,
      maxValue: 100,
      labelFormat: (value) => `${value}점`,
    },
    {
      id: '3',
      type: 'emoji',
      title: '오늘 약을 제대로 드셨나요?',
      options: [
        { emoji: '✅', label: '예', value: 'yes' },
        { emoji: '❌', label: '아니오', value: 'no' },
      ],
    },
    {
      id: '4',
      type: 'image',
      title: '어떤 프로필 이미지를 사용하시겠나요?',
      subtitle: '이미지 선택',
      options: [
        { imageUri: 'https://images.unsplash.com/photo-1494790108755-2616b612b4e2?w=100&h=100&fit=crop&crop=face', label: '상냥한 표정', value: 'img_1' },
        { imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', label: '밝은 표정', value: 'img_2' },
        { imageUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', label: '차분한 표정', value: 'img_3' },
      ],
    },
  ];

  // 문진 질문 가져오기 (더미)
  static async getSurveyQuestions(): Promise<SurveyResponse> {
    return new Promise((resolve) => {
      // API 호출 시뮬레이션 (0.5초 딜레이)
      setTimeout(() => {
        resolve({
          success: true,
          questions: this.dummyQuestions,
        });
      }, 500);
    });
  }

  // 오늘 문진 완료 여부 확인
  static async isTodaySurveyCompleted(): Promise<boolean> {
    try {
      const today = new Date().toDateString();
      const dailySurveys = await this.getDailySurveys();
      const todaySurvey = dailySurveys.find(survey => survey.date === today);
      return todaySurvey?.completed || false;
    } catch (error) {
      console.error('문진 완료 여부 확인 실패:', error);
      return false;
    }
  }

  // 일일 문진 목록 가져오기
  static async getDailySurveys(): Promise<DailySurvey[]> {
    try {
      const surveysString = await AsyncStorage.getItem(this.DAILY_SURVEYS_KEY);
      return surveysString ? JSON.parse(surveysString) : [];
    } catch (error) {
      console.error('일일 문진 목록 가져오기 실패:', error);
      return [];
    }
  }

  // 문진 답변 저장
  static async saveSurveyAnswers(answers: Record<string, any>): Promise<boolean> {
    try {
      const today = new Date().toDateString();
      const surveyAnswers: SurveyAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        timestamp: Date.now(),
      }));

      const dailySurveys = await this.getDailySurveys();
      const existingSurveyIndex = dailySurveys.findIndex(survey => survey.date === today);

      const newSurvey: DailySurvey = {
        id: `survey_${Date.now()}`,
        date: today,
        answers: surveyAnswers,
        completed: true,
      };

      if (existingSurveyIndex >= 0) {
        dailySurveys[existingSurveyIndex] = newSurvey;
      } else {
        dailySurveys.unshift(newSurvey);
      }

      await AsyncStorage.setItem(this.DAILY_SURVEYS_KEY, JSON.stringify(dailySurveys));
      return true;
    } catch (error) {
      console.error('문진 답변 저장 실패:', error);
      return false;
    }
  }

  // 특정 날짜의 문진 답변 가져오기
  static async getSurveyAnswersByDate(date: string): Promise<SurveyAnswer[]> {
    try {
      const dailySurveys = await this.getDailySurveys();
      const survey = dailySurveys.find(s => s.date === date);
      return survey?.answers || [];
    } catch (error) {
      console.error('문진 답변 가져오기 실패:', error);
      return [];
    }
  }

  // 문진 통계 가져오기
  static async getSurveyStats(): Promise<{
    totalSurveys: number;
    completedThisWeek: number;
    streak: number;
  }> {
    try {
      const dailySurveys = await this.getDailySurveys();
      const completedSurveys = dailySurveys.filter(survey => survey.completed);
      
      // 이번 주 완료된 문진 수
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const completedThisWeek = completedSurveys.filter(survey => {
        const surveyDate = new Date(survey.date);
        return surveyDate >= oneWeekAgo;
      }).length;

      // 연속 완료 일수 계산
      let streak = 0;
      const sortedSurveys = completedSurveys.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      for (let i = 0; i < sortedSurveys.length; i++) {
        const surveyDate = new Date(sortedSurveys[i].date);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (surveyDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      return {
        totalSurveys: completedSurveys.length,
        completedThisWeek,
        streak,
      };
    } catch (error) {
      console.error('문진 통계 가져오기 실패:', error);
      return {
        totalSurveys: 0,
        completedThisWeek: 0,
        streak: 0,
      };
    }
  }

  // 문진 데이터 초기화 (개발용)
  static async clearSurveyData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.DAILY_SURVEYS_KEY);
      await AsyncStorage.removeItem(this.CURRENT_SURVEY_KEY);
    } catch (error) {
      console.error('문진 데이터 초기화 실패:', error);
    }
  }

  // 내 답변 페이지용 날짜별 문진 리스트 가져오기
  static async getAnswerGroups(): Promise<{
    date: string;
    answers: {
      id: string;
      date: string;
      question: string;
      answer: string;
      type: 'emoji' | 'slider' | 'yesno' | 'image';
    }[];
  }[]> {
    try {
      const dailySurveys = await this.getDailySurveys();
      const questions = await this.getSurveyQuestions();
      
      if (!questions.success || !questions.questions) {
        return [];
      }

      const answerGroups = dailySurveys
        .filter(survey => survey.completed)
        .map(survey => {
          const formattedDate = new Date(survey.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\./g, '.').replace(/\s/g, '');

          const answers = survey.answers.map(answer => {
            const question = questions.questions!.find(q => q.id === answer.questionId);
            if (!question) return null;

            let answerText = '';
            switch (question.type) {
              case 'emoji':
                const emojiOption = question.options?.find(opt => opt.value === answer.answer);
                answerText = emojiOption ? `${emojiOption.emoji} ${emojiOption.label}` : answer.answer;
                break;
              case 'slider':
                answerText = question.labelFormat ? question.labelFormat(answer.answer) : `${answer.answer}점`;
                break;
              case 'yesno':
                const yesNoOption = question.options?.find(opt => opt.value === answer.answer);
                answerText = yesNoOption ? `${yesNoOption.emoji} ${yesNoOption.label}` : answer.answer;
                break;
              case 'image':
                const imageOption = question.options?.find(opt => opt.value === answer.answer);
                answerText = imageOption ? imageOption.label : answer.answer;
                break;
              default:
                answerText = answer.answer;
            }

            return {
              id: answer.questionId,
              date: formattedDate,
              question: question.title,
              answer: answerText,
              type: question.type,
            };
          }).filter((answer): answer is NonNullable<typeof answer> => answer !== null);

          return {
            date: formattedDate,
            answers,
          };
        })
        .filter(group => group.answers.length > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return answerGroups;
    } catch (error) {
      console.error('답변 그룹 가져오기 실패:', error);
      return [];
    }
  }

  // 더미 데이터 초기화 (개발용)
  static async initializeDummyData(): Promise<void> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const dummySurveys: DailySurvey[] = [
        {
          id: 'survey_1',
          date: today.toDateString(),
          answers: [
            { questionId: '1', answer: 'happy', timestamp: Date.now() },
            { questionId: '2', answer: 75, timestamp: Date.now() },
            { questionId: '3', answer: 'yes', timestamp: Date.now() },
            { questionId: '4', answer: 'img_1', timestamp: Date.now() },
          ],
          completed: true,
        },
        {
          id: 'survey_2',
          date: yesterday.toDateString(),
          answers: [
            { questionId: '1', answer: 'normal', timestamp: Date.now() },
            { questionId: '2', answer: 60, timestamp: Date.now() },
            { questionId: '3', answer: 'no', timestamp: Date.now() },
          ],
          completed: true,
        },
        {
          id: 'survey_3',
          date: twoDaysAgo.toDateString(),
          answers: [
            { questionId: '1', answer: 'very_bad', timestamp: Date.now() },
            { questionId: '2', answer: 40, timestamp: Date.now() },
            { questionId: '3', answer: 'yes', timestamp: Date.now() },
            { questionId: '4', answer: 'img_2', timestamp: Date.now() },
          ],
          completed: true,
        },
      ];

      await AsyncStorage.setItem(this.DAILY_SURVEYS_KEY, JSON.stringify(dummySurveys));
    } catch (error) {
      console.error('더미 데이터 초기화 실패:', error);
    }
  }
}

export default SurveyService; 