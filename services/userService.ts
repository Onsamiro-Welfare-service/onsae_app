import { post } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  center: string;
  loginCode: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  user: {
    id: number;
    userType: string;
    name: string;
    email: string;
    institutionId: number;
    institutionName: string;
    authorities: string[];
  };
}

class UserService {
  private static readonly USER_KEY = '@user_info';
  private static readonly LOGIN_STATUS_KEY = '@login_status';
  private static readonly LOGIN_ENDPOINT = '/api/user/login';
  private static readonly TOKEN_KEY = '@auth_tokens';

  static async login(loginCode: string): Promise<LoginResponse> {
    try {
      console.log('loginCode',loginCode);
      const res = await post<{ loginCode: string }, BackendLoginResponse>(
        this.LOGIN_ENDPOINT,
        { loginCode }
      );
      console.log('res',res);
      const mappedUser: User = {
        id: String(res.user.id),
        name: res.user.name,
        center: res.user.institutionName,
        loginCode,
      };

      // Persist tokens and user info atomically
      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        tokenType: res.tokenType,
        expiresAt: res.expiresAt,
      }));

      // Save user info and login status
      await this.saveUserInfo(mappedUser);

      return {
        success: true,
        user: mappedUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || '로그인에 실패했습니다.',
      };
    }
  }

  static async saveUserInfo(user: User): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(this.LOGIN_STATUS_KEY, 'true');
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(this.USER_KEY);
      const loginStatus = await AsyncStorage.getItem(this.LOGIN_STATUS_KEY);
      if (userString && loginStatus === 'true') {
        return JSON.parse(userString) as User;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청 (세션 무효화)
      try {
        await post('/api/user/logout', {});
      } catch (error) {
        // 서버 로그아웃 실패해도 로컬 정리는 진행
        console.warn('서버 로그아웃 실패:', error);
      }
    } finally {
      // 로컬 저장소 정리 (서버 요청 성공/실패와 관계없이 항상 실행)
      await AsyncStorage.removeItem(this.USER_KEY);
      await AsyncStorage.removeItem(this.LOGIN_STATUS_KEY);
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static async updateUserInfo(userId: string, updates: Partial<User>): Promise<User | null> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      return null;
    }
    const updatedUser = { ...currentUser, ...updates };
    await this.saveUserInfo(updatedUser);
    return updatedUser;
  }

  static async isLoggedIn(): Promise<boolean> {
    try {
      const loginStatus = await AsyncStorage.getItem(this.LOGIN_STATUS_KEY);
      if (loginStatus !== 'true') return false;
      const tokens = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!tokens) return false;
      try {
        const { expiresAt } = JSON.parse(tokens);
        if (expiresAt) {
          const exp = new Date(expiresAt).getTime();
          if (!Number.isNaN(exp) && exp < Date.now()) {
            return false;
          }
        }
      } catch {}
      return true;
    } catch {
      return false;
    }
  }
}

export default UserService;
