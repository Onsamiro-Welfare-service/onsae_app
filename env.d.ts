/// <reference types="expo/types" />

// 환경 변수 타입 정의
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL?: string;
      EXPO_OPTIMIZED?: string;
    }
  }
}

export { };

