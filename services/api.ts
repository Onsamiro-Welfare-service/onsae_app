import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants/config';
import { getUserFriendlyErrorMessage } from '@/utils/errorUtils';

const BASE_URL = Platform.select({
  ios: API_BASE_URL,
  android: API_BASE_URL,
  default: API_BASE_URL,
}) as string;

export interface ApiOptions {
  headers?: Record<string, string>;
}

const TOKEN_STORAGE_KEY = '@auth_tokens';

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.log('url',url);
  // Attach Authorization header if token exists and not already provided
  const headers = new Headers(init.headers as any);
  try {
    if (!headers.has('Authorization')) {
      const tokenStr = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (tokenStr) {
        const { accessToken, tokenType } = JSON.parse(tokenStr);
        if (accessToken) {
          headers.set('Authorization', `${tokenType || 'Bearer'} ${accessToken}`);
        }
      }
    }
  } catch {}

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (fetchError: any) {
    // 네트워크 에러 (연결 실패, 타임아웃 등)
    const friendlyMessage = getUserFriendlyErrorMessage(
      fetchError?.message || 'Network request failed',
      undefined
    );
    throw new Error(friendlyMessage);
  }

  const text = await res.text();
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = (isJson && text) ? JSON.parse(text) : (undefined as unknown as T);
  console.log('res',res);
  if (!res.ok) {
    // 400~500 에러 처리
    let message = res.statusText || 'Request failed';
    if (res.status >= 400 && res.status < 600) {
      const errorData = data as any;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // errors[0]의 message를 추출
        message = errorData.errors[0].message || errorData.errors[0] || message;
      } else if (errorData?.message) {
        message = errorData.message;
      }
    }
    
    // 사용자 친화적인 메시지로 변환
    const friendlyMessage = getUserFriendlyErrorMessage(message, undefined);
    throw new Error(friendlyMessage);
  }

  return data as T;
}

export async function get<TRes>(path: string, options?: ApiOptions): Promise<TRes> {
  const headers: Record<string, string> = {
    ...(options?.headers || {}),
  };
  return request<TRes>(path, {
    method: 'GET',
    headers,
  });
}

export async function post<TReq, TRes>(path: string, body: TReq, options?: ApiOptions): Promise<TRes> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  return request<TRes>(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * multipart/form-data로 파일 업로드를 수행하는 함수
 * @param path API 엔드포인트 경로
 * @param formData FormData 객체
 * @param options 추가 옵션 (헤더 등)
 * @returns API 응답 데이터
 */
export async function postFormData<TRes>(path: string, formData: FormData, options?: ApiOptions): Promise<TRes> {
  const headers: Record<string, string> = {
    // multipart/form-data일 때는 Content-Type을 명시하지 않음 (브라우저가 자동으로 boundary를 추가)
    ...(options?.headers || {}),
  };

  return request<TRes>(path, {
    method: 'POST',
    headers,
    body: formData as any,
  });
}

export default {
  get,
  post,
  postFormData,
};
