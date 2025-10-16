import AsyncStorage from '@react-native-async-storage/async-storage';

// 문의하기 타입 정의
export interface Inquiry {
  id: string;
  message: string;
  imageUri?: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'replied';
  reply?: string;
  replyTimestamp?: number;
}

export interface InquiryResponse {
  success: boolean;
  inquiry?: Inquiry;
  message?: string;
}

export interface InquiryListResponse {
  success: boolean;
  inquiries?: Inquiry[];
  message?: string;
}

class InquiryService {
  // AsyncStorage 키
  private static readonly INQUIRIES_KEY = '@inquiries';

  // 문의하기 전송 (더미)
  static async sendInquiry(message: string, imageUri?: string): Promise<InquiryResponse> {
    return new Promise((resolve) => {
      // API 호출 시뮬레이션 (1초 딜레이)
      setTimeout(() => {
        const newInquiry: Inquiry = {
          id: `inquiry_${Date.now()}`,
          message: message.trim(),
          imageUri,
          timestamp: Date.now(),
          status: 'sent',
        };

        // 로컬 저장
        this.saveInquiry(newInquiry);

        resolve({
          success: true,
          inquiry: newInquiry,
          message: '문의사항이 성공적으로 전송되었습니다.',
        });
      }, 1000);
    });
  }

  // 문의하기 목록 가져오기
  static async getInquiries(): Promise<InquiryListResponse> {
    return new Promise((resolve) => {
      // API 호출 시뮬레이션 (0.5초 딜레이)
      setTimeout(async () => {
        try {
          const inquiries = await this.getLocalInquiries();
          resolve({
            success: true,
            inquiries: inquiries.sort((a, b) => b.timestamp - a.timestamp),
          });
        } catch (error) {
          resolve({
            success: false,
            message: '문의 목록을 불러오는데 실패했습니다.',
          });
        }
      }, 500);
    });
  }

  // 특정 문의하기 상세 정보 가져오기
  static async getInquiryById(id: string): Promise<InquiryResponse> {
    return new Promise(async (resolve) => {
      try {
        const inquiries = await this.getLocalInquiries();
        const inquiry = inquiries.find(i => i.id === id);
        
        if (inquiry) {
          resolve({
            success: true,
            inquiry,
          });
        } else {
          resolve({
            success: false,
            message: '문의사항을 찾을 수 없습니다.',
          });
        }
      } catch (error) {
        resolve({
          success: false,
          message: '문의사항을 불러오는데 실패했습니다.',
        });
      }
    });
  }

  // 문의하기 상태 업데이트 (답변 받았을 때)
  static async updateInquiryStatus(id: string, status: Inquiry['status'], reply?: string): Promise<InquiryResponse> {
    return new Promise(async (resolve) => {
      try {
        const inquiries = await this.getLocalInquiries();
        const inquiryIndex = inquiries.findIndex(i => i.id === id);
        
        if (inquiryIndex >= 0) {
          inquiries[inquiryIndex] = {
            ...inquiries[inquiryIndex],
            status,
            reply,
            replyTimestamp: reply ? Date.now() : undefined,
          };

          await AsyncStorage.setItem(this.INQUIRIES_KEY, JSON.stringify(inquiries));
          
          resolve({
            success: true,
            inquiry: inquiries[inquiryIndex],
            message: '문의사항 상태가 업데이트되었습니다.',
          });
        } else {
          resolve({
            success: false,
            message: '문의사항을 찾을 수 없습니다.',
          });
        }
      } catch (error) {
        resolve({
          success: false,
          message: '문의사항 업데이트에 실패했습니다.',
        });
      }
    });
  }

  // 문의하기 통계 가져오기
  static async getInquiryStats(): Promise<{
    totalInquiries: number;
    pendingInquiries: number;
    repliedInquiries: number;
  }> {
    try {
      const inquiries = await this.getLocalInquiries();
      
      return {
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
        repliedInquiries: inquiries.filter(i => i.status === 'replied').length,
      };
    } catch (error) {
      console.error('문의 통계 가져오기 실패:', error);
      return {
        totalInquiries: 0,
        pendingInquiries: 0,
        repliedInquiries: 0,
      };
    }
  }

  // 로컬 문의하기 목록 가져오기
  private static async getLocalInquiries(): Promise<Inquiry[]> {
    try {
      const inquiriesString = await AsyncStorage.getItem(this.INQUIRIES_KEY);
      return inquiriesString ? JSON.parse(inquiriesString) : [];
    } catch (error) {
      console.error('로컬 문의 목록 가져오기 실패:', error);
      return [];
    }
  }

  // 문의하기 로컬 저장
  private static async saveInquiry(inquiry: Inquiry): Promise<void> {
    try {
      const inquiries = await this.getLocalInquiries();
      inquiries.unshift(inquiry);
      await AsyncStorage.setItem(this.INQUIRIES_KEY, JSON.stringify(inquiries));
    } catch (error) {
      console.error('문의 저장 실패:', error);
    }
  }

  // 문의하기 데이터 초기화 (개발용)
  static async clearInquiryData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.INQUIRIES_KEY);
    } catch (error) {
      console.error('문의 데이터 초기화 실패:', error);
    }
  }

  // 더미 데이터 초기화 (개발용)
  static async initializeDummyData(): Promise<void> {
    try {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);

      const dummyInquiries: Inquiry[] = [
        {
          id: 'inquiry_1',
          message: '오늘 문진에서 약 복용 관련 질문이 있었는데, 복용 시간을 정확히 지켜야 하나요?',
          timestamp: now,
          status: 'replied',
          reply: '네, 약 복용 시간을 정확히 지키는 것이 중요합니다. 의사와 상담하신 복용 시간을 지켜주세요.',
          replyTimestamp: now - (2 * 60 * 60 * 1000), // 2시간 전
        },
        {
          id: 'inquiry_2',
          message: '몸 상태가 좋지 않을 때는 어떻게 해야 할까요?',
          timestamp: oneDayAgo,
          status: 'replied',
          reply: '몸 상태가 좋지 않을 때는 충분한 휴식을 취하고, 증상이 지속되면 의료진에게 연락하시기 바랍니다.',
          replyTimestamp: oneDayAgo + (30 * 60 * 1000), // 30분 후
        },
        {
          id: 'inquiry_3',
          message: '문진 앱 사용법에 대해 궁금합니다.',
          timestamp: twoDaysAgo,
          status: 'sent',
        },
        {
          id: 'inquiry_4',
          message: '복지관 운영 시간이 어떻게 되나요?',
          timestamp: threeDaysAgo,
          status: 'replied',
          reply: '복지관 운영 시간은 평일 오전 9시부터 오후 6시까지입니다. 주말에는 휴무입니다.',
          replyTimestamp: threeDaysAgo + (1 * 60 * 60 * 1000), // 1시간 후
        },
      ];

      await AsyncStorage.setItem(this.INQUIRIES_KEY, JSON.stringify(dummyInquiries));
    } catch (error) {
      console.error('더미 데이터 초기화 실패:', error);
    }
  }
}

export default InquiryService; 