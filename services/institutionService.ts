import { get } from '@/services/api';

export interface Institution {
  id: number;
  name: string;
  businessNumber: string;
  address: string;
  phone: string;
  directorName: string;
  adminCount: number;
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

class InstitutionService {
  private static readonly INSTITUTIONS_ENDPOINT = '/api/institutions';

  // 기관 목록 조회
  static async getInstitutions(): Promise<Institution[]> {
    try {
      const data = await get<Institution[]>(this.INSTITUTIONS_ENDPOINT);
      return data;
    } catch (error) {
      console.error('기관 목록 조회 실패:', error);
      throw error;
    }
  }
}

export default InstitutionService;

