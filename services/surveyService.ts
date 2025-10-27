import { get } from './api';

// 문진 타입 정의
export type SurveyType = 'emoji' | 'slider' | 'yesno' | 'image';

// 서버 질문 타입 정의
export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TEXT'
  | 'SCALE'
  | 'YES_NO'
  | 'DATE'
  | 'TIME';

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface ServerQuestion {
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
  // 오늘 문진 완료 여부 확인 (pending API 사용)
  static async isTodaySurveyCompleted(): Promise<boolean> {
    try {
      const pendingQuestions = await get<ServerQuestion[]>('/api/user/questions/pending');
      // pending 질문이 없으면 오늘 문진이 완료된 것으로 간주
      return pendingQuestions.length === 0;
    } catch (error) {
      console.error('문진 완료 여부 확인 실패:', error);
      return false;
    }
  }

  // 서버에서 질문 목록 가져오기
  static async getSurveyQuestions(): Promise<ServerQuestion[]> {
    try {
      const data = await get<ServerQuestion[]>('/api/user/questions');
      const sorted = [...data].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      return sorted;
    } catch (error) {
      console.error('설문 질문 로드 실패:', error);
      throw error;
    }
  }

  // 완료된 질문 목록 가져오기
  static async getCompletedQuestions(): Promise<ServerQuestion[]> {
    try {
      const data = await get<ServerQuestion[]>('/api/user/questions/completed');
      return data;
    } catch (error) {
      console.error('완료된 질문 로드 실패:', error);
      throw error;
    }
  }

}

export default SurveyService; 