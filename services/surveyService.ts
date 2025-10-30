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

// 사용자 응답 조회 API 타입
export interface UserResponse {
  responseId: number;
  assignmentId: number;
  questionId: number;
  questionTitle: string;
  questionContent: string;
  questionType: QuestionType;
  userId: number;
  userName: string;
  responseData: {
    note: string | null;
    answer: string | boolean | number | null;
    otherText?: string | null;
    answers?: string[];
    questionId: number;
  };
  responseText: string | null;
  otherResponse: string | null;
  responseTimeSeconds: number | null;
  submittedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  isModified: boolean;
  modificationCount: number;
}

export interface UserResponsesResponse {
  userId: number;
  userName: string;
  totalResponses: number;
  latestResponseAt: string;
  responses: UserResponse[];
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

  // 사용자 응답 조회
  static async getUserResponses(userId: number): Promise<UserResponsesResponse> {
    try {
      const data = await get<UserResponsesResponse>(`/api/responses/user/${userId}`);
      return data;
    } catch (error) {
      console.error('사용자 응답 로드 실패:', error);
      throw error;
    }
  }

}

export default SurveyService; 