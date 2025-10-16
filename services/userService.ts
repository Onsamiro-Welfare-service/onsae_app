import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 관련 API 서비스
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

class UserService {
  // AsyncStorage 키
  private static readonly USER_KEY = '@user_info';
  private static readonly LOGIN_STATUS_KEY = '@login_status';

  // 더미 사용자 데이터
  private static dummyUsers = [
    { id: 'user1', code: '1234', name: '김철수', center: '서울복지관' },
    { id: 'user2', code: '5678', name: '이영희', center: '부산복지관' },
    { id: 'user3', code: '9999', name: '박민수', center: '대구복지관' },
  ];

  // 로그인 API 호출 (더미)
  static async login(loginCode: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      // API 호출 시뮬레이션 (1초 딜레이)
      setTimeout(() => {
        const user = this.dummyUsers.find(u => u.code === loginCode);
        
        if (user) {
          // 로그인 성공
          resolve({
            success: true,
            user: {
              id: user.id,
              name: user.name,
              center: user.center,
              loginCode: user.code,
            }
          });
        } else {
          // 로그인 실패
          resolve({
            success: false,
            message: '올바른 로그인 코드를 입력해주세요.'
          });
        }
      }, 1000);
    });
  }

  // 사용자 정보 저장 (AsyncStorage 사용)
  static async saveUserInfo(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(this.LOGIN_STATUS_KEY, 'true');
      console.log('사용자 정보 저장 완료:', user);
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      throw error;
    }
  }

  // 저장된 사용자 정보 가져오기
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(this.USER_KEY);
      const loginStatus = await AsyncStorage.getItem(this.LOGIN_STATUS_KEY);
      
      if (userString && loginStatus === 'true') {
        const user = JSON.parse(userString) as User;
        console.log('저장된 사용자 정보 조회:', user);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  }

  // 로그아웃
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_KEY);
      await AsyncStorage.removeItem(this.LOGIN_STATUS_KEY);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 사용자 정보 업데이트
  static async updateUserInfo(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return null;
      }

      const updatedUser = { ...currentUser, ...updates };
      await this.saveUserInfo(updatedUser);
      
      console.log('사용자 정보 업데이트 완료:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      return null;
    }
  }

  // 로그인 상태 확인
  static async isLoggedIn(): Promise<boolean> {
    try {
      const loginStatus = await AsyncStorage.getItem(this.LOGIN_STATUS_KEY);
      return loginStatus === 'true';
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      return false;
    }
  }
}

export default UserService; 