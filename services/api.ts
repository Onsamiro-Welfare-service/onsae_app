import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


// 환경 변수에서 API URL 가져오기 (없으면 기본값 사용)
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // 기본값 (개발 환경)
  return Platform.select({
    ios: 'http://localhost:8080',
    android: 'http://192.168.0.3:8080',
    default: 'http://localhost:8080',
  }) as string;
};

const BASE_URL = getBaseUrl();

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

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = (isJson && text) ? JSON.parse(text) : (undefined as unknown as T);
  
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
      // TossAlert 메시지 표시
      console.log('message',message);

    }
    throw new Error(message);
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

export default {
  get,
  post,
};
