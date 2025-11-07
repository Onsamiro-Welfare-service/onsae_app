
// 환경별 API URL 설정
export const getApiUrl = () => {
  // EAS 빌드 시 환경변수 사용
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // __DEV__ 체크로 개발/프로덕션 구분
  if (__DEV__) {
    return 'http://192.168.0.3:8080';
    // return 'api.onsaemiro.site';
  }

  // 프로덕션 기본값 (배포 시 실제 서버 URL로 변경)
  return 'https://api.onsaemiro.site';
};

export const API_BASE_URL = getApiUrl();
