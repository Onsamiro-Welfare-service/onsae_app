/**
 * 에러 메시지를 사용자 친화적인 메시지로 변환하는 유틸리티 함수
 */

/**
 * 백엔드 에러 메시지를 사용자 친화적인 메시지로 변환
 * @param errorMessage 원본 에러 메시지
 * @param context 에러가 발생한 컨텍스트 (예: 'login', 'signup', 'upload' 등)
 * @returns 사용자 친화적인 에러 메시지
 */
export function getUserFriendlyErrorMessage(
  errorMessage: string | null | undefined,
  context?: string
): string {
  if (!errorMessage) {
    return getDefaultErrorMessage(context);
  }

  const message = errorMessage.trim().toLowerCase();

  // 네트워크 관련 에러
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('연결') ||
    message.includes('서버와의 연결') ||
    message.includes('원할하지 않습니다') ||
    message.includes('원활하지 않습니다')
  ) {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  }

  // 타임아웃 에러
  if (message.includes('timeout') || message.includes('타임아웃')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  // 인증 관련 에러
  if (
    message.includes('unauthorized') ||
    message.includes('인증') ||
    message.includes('authentication') ||
    message.includes('사용자 정보가 일치하지 않습니다') ||
    message.includes('일치하지 않습니다')
  ) {
    if (context === 'login') {
      return '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
    return '인증에 실패했습니다. 다시 시도해주세요.';
  }

  // 권한 관련 에러
  if (
    message.includes('forbidden') ||
    message.includes('권한') ||
    message.includes('permission')
  ) {
    return '접근 권한이 없습니다.';
  }

  // 서버 에러
  if (
    message.includes('internal server error') ||
    message.includes('500') ||
    message.includes('서버 오류')
  ) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 찾을 수 없음
  if (
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('찾을 수 없')
  ) {
    return '요청한 정보를 찾을 수 없습니다.';
  }

  // 잘못된 요청
  if (
    message.includes('bad request') ||
    message.includes('400') ||
    message.includes('잘못된')
  ) {
    return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
  }

  // 파일 관련 에러
  if (
    message.includes('file') ||
    message.includes('파일') ||
    message.includes('upload') ||
    message.includes('업로드')
  ) {
    if (message.includes('too large') || message.includes('크기')) {
      return '파일 크기가 너무 큽니다.';
    }
    if (message.includes('type') || message.includes('형식')) {
      return '지원하지 않는 파일 형식입니다.';
    }
    return '파일 처리 중 오류가 발생했습니다.';
  }

  // 기본적으로 원본 메시지를 반환하되, 너무 기술적인 메시지는 변환
  if (
    message.includes('error') ||
    message.includes('exception') ||
    message.includes('오류') ||
    message.includes('에러')
  ) {
    // 이미 사용자 친화적인 메시지인 경우 그대로 반환
    if (
      errorMessage.includes('입력') ||
      errorMessage.includes('확인') ||
      errorMessage.includes('다시')
    ) {
      return errorMessage;
    }
    return getDefaultErrorMessage(context);
  }

  // 알 수 없는 에러인 경우 기본 메시지 반환
  return getDefaultErrorMessage(context);
}

/**
 * 컨텍스트에 따른 기본 에러 메시지 반환
 * @param context 에러가 발생한 컨텍스트
 * @returns 기본 에러 메시지
 */
function getDefaultErrorMessage(context?: string): string {
  switch (context) {
    case 'login':
      return '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
    case 'signup':
      return '회원가입에 실패했습니다. 입력 정보를 확인해주세요.';
    case 'upload':
    case 'inquiry':
      return '요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.';
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.';
  }
}

/**
 * 네트워크 에러인지 확인
 * @param error 에러 객체 또는 메시지
 * @returns 네트워크 에러 여부
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const message = (error?.message || String(error)).toLowerCase();

  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('연결') ||
    message.includes('timeout') ||
    message.includes('타임아웃')
  );
}

