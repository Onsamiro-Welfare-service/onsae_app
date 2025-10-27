import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


const BASE_URL = Platform.select({
  // iOS simulator can use localhost
  ios: 'http://localhost:8080',
  // Android emulator needs host loopback address
  // android: 'http://10.0.2.2:8080',
  android: 'http://192.168.0.3:8080',
  // Web or others fallback
  default: 'http://localhost:8080',
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
