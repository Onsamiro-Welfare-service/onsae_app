import { API_BASE_URL } from '@/constants/config';
import { get, postFormData } from '@/services/api';

/**
 * 파일 타입 열거형
 * 서버에서 반환하는 파일 타입을 나타냅니다.
 */
export type FileType = 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'TEXT';

/**
 * 업로드된 파일 정보 인터페이스
 * 서버에서 반환하는 파일 상세 정보를 나타냅니다.
 */
export interface UploadFile {
  /** 파일 ID */
  id: number;
  /** 파일 타입 (IMAGE, AUDIO, VIDEO, DOCUMENT, TEXT) */
  fileType: FileType;
  /** 저장된 파일명 */
  fileName: string;
  /** 원본 파일명 */
  originalName: string;
  /** 파일 경로 */
  filePath: string;
  /** 파일 크기 (바이트) */
  fileSize: number;
  /** MIME 타입 */
  mimeType: string;
  /** 재생 시간 (초, 음성/비디오 파일의 경우) */
  durationSeconds: number | null;
  /** 이미지 너비 (이미지 파일의 경우) */
  imageWidth: number | null;
  /** 이미지 높이 (이미지 파일의 경우) */
  imageHeight: number | null;
  /** 썸네일 경로 */
  thumbnailPath: string | null;
  /** 업로드 순서 */
  uploadOrder: number;
  /** 생성일시 */
  createdAt: string;
}

/**
 * 업로드 상세 응답 인터페이스
 * 서버에서 반환하는 전체 업로드 정보를 나타냅니다.
 */
export interface UploadDetailResponse {
  /** 업로드 ID */
  id: number;
  /** 제목 (선택사항, 최대 200자) */
  title: string | null;
  /** 내용 (선택사항) */
  content: string | null;
  /** 사용자 ID */
  userId: number;
  /** 사용자 이름 */
  userName: string;
  /** 기관 ID */
  institutionId: number;
  /** 기관 이름 */
  institutionName: string;
  /** 관리자 읽음 여부 */
  adminRead: boolean;
  /** 관리자 답변 내용 */
  adminResponse: string | null;
  /** 관리자 답변 일시 */
  adminResponseDate: string | null;
  /** 관리자 ID */
  adminId: number | null;
  /** 관리자 이름 */
  adminName: string | null;
  /** 업로드된 파일 목록 */
  files: UploadFile[];
  /** 생성일시 */
  createdAt: string;
  /** 수정일시 */
  updatedAt: string;
}

/**
 * 업로드 목록 항목 인터페이스
 * 목록 조회 시 반환되는 요약 정보를 나타냅니다.
 */
export interface UploadListItem {
  /** 업로드 ID */
  id: number;
  /** 제목 (선택사항) */
  title: string | null;
  /** 내용 미리보기 (일부만 표시) */
  contentPreview: string | null;
  /** 사용자 ID */
  userId: number;
  /** 사용자 이름 */
  userName: string;
  /** 기관 ID */
  institutionId: number;
  /** 기관 이름 */
  institutionName: string;
  /** 관리자 읽음 여부 */
  adminRead: boolean;
  /** 관리자 답변 일시 */
  adminResponseDate: string | null;
  /** 파일 개수 */
  fileCount: number;
  /** 첫 번째 파일 타입 */
  firstFileType: FileType | null;
  /** 생성일시 */
  createdAt: string;
}

/**
 * 파일 업로드 요청 인터페이스
 * 업로드 시 전송할 데이터를 나타냅니다.
 */
export interface UploadRequest {
  /** 제목 (선택사항, 최대 200자) */
  title?: string;
  /** 내용 (선택사항) */
  content?: string;
  /** 업로드할 파일 URI 목록 */
  files: string[];
}

/**
 * 파일 업로드 응답 인터페이스
 * 업로드 성공 시 반환되는 응답을 나타냅니다.
 */
export interface UploadResponse {
  success: boolean;
  upload?: UploadDetailResponse;
  message?: string;
}

/**
 * 업로드 목록 조회 응답 인터페이스
 */
export interface UploadListResponse {
  success: boolean;
  uploads?: UploadListItem[];
  message?: string;
}

/**
 * 업로드 상세 조회 응답 인터페이스
 */
export interface UploadDetailResponseType {
  success: boolean;
  upload?: UploadDetailResponse;
  message?: string;
}

/**
 * 문의하기 서비스 클래스
 * 파일 업로드 및 문의 조회 기능을 제공합니다.
 */
class InquiryService {
  /** API 엔드포인트 경로 */
  private static readonly UPLOADS_ENDPOINT = '/api/user/uploads';

  /**
   * 파일 업로드 (문의하기 전송)
   * 
   * @param request 업로드 요청 데이터 (제목, 내용, 파일 목록)
   * @returns 업로드 성공 여부 및 업로드 정보
   * 
   * @throws {Error} 파일이 없거나, 파일 타입 오류, 파일 크기 초과 등의 경우
   * 
   * 예시:
   * ```typescript
   * const response = await InquiryService.uploadFiles({
   *   title: '건강검진 결과지',
   *   content: '2024년 건강검진 결과지를 업로드합니다.',
   *   files: ['file:///path/to/image.jpg']
   * });
   * ```
   */
  static async uploadFiles(request: UploadRequest): Promise<UploadResponse> {
    try {
      // 파일이 없는 경우 에러
      // if (!request.files || request.files.length === 0) {
      //   return {
      //     success: false,
      //     message: '파일을 선택해주세요.',
      //   };
      // }

      // FormData 생성
      const formData = new FormData();

      // 제목 추가 (있는 경우)
      if (request.title && request.title.trim()) {
        formData.append('title', request.title.trim());
      }

      // 내용 추가 (있는 경우)
      if (request.content && request.content.trim()) {
        formData.append('content', request.content.trim());
      }

      // 파일 추가
      // React Native에서는 파일 URI를 사용하여 파일을 추가합니다.
      // 파일명 추출을 위한 로직
      request.files.forEach((fileUri, index) => {
        // URI에서 파일명 추출 (예: file:///path/to/image.jpg -> image.jpg)
        const fileName = fileUri.split('/').pop() || `file_${index}`;
        // 파일 확장자로부터 타입 추정
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        
        // 파일 타입 결정
        let mimeType = 'application/octet-stream';
        
        // 이미지 파일
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
          mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        }
        // 음성 파일
        else if (['mp3', 'wav', 'm4a', 'aac'].includes(fileExtension)) {
          mimeType = `audio/${fileExtension}`;
        }
        // 비디오 파일
        else if (['mp4', 'avi', 'mov', 'mkv'].includes(fileExtension)) {
          mimeType = `video/${fileExtension}`;
        }
        // 문서 파일
        else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
          if (fileExtension === 'pdf') mimeType = 'application/pdf';
          else if (['doc', 'docx'].includes(fileExtension)) mimeType = 'application/msword';
          else if (['xls', 'xlsx'].includes(fileExtension)) mimeType = 'application/vnd.ms-excel';
        }
        // 텍스트 파일
        else if (['txt', 'md'].includes(fileExtension)) {
          mimeType = 'text/plain';
        }

        // React Native에서는 파일을 추가할 때 uri, type, name을 지정합니다.
        formData.append('files', {
          uri: fileUri,
          type: mimeType,
          name: fileName,
        } as any);
      });

      // API 호출
      const response = await postFormData<UploadDetailResponse>(
        this.UPLOADS_ENDPOINT,
        formData
      );

      return {
        success: true,
        upload: response,
        message: '문의사항이 성공적으로 전송되었습니다.',
      };
    } catch (error: any) {
      console.error('파일 업로드 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = '문의 전송에 실패했습니다.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 내 업로드 목록 조회
   * 현재 로그인한 사용자의 모든 업로드 목록을 가져옵니다.
   * 
   * @returns 업로드 목록 조회 성공 여부 및 업로드 목록
   * 
   * 예시:
   * ```typescript
   * const response = await InquiryService.getUploadList();
   * if (response.success && response.uploads) {
   *   response.uploads.forEach(upload => {
   *     console.log(upload.title, upload.file_count);
   *   });
   * }
   * ```
   */
  static async getUploadList(): Promise<UploadListResponse> {
    try {
      const uploads = await get<UploadListItem[]>(this.UPLOADS_ENDPOINT);

      return {
        success: true,
        uploads: uploads.sort((a, b) => {
          // 최신순 정렬 (created_at 내림차순)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
      };
    } catch (error: any) {
      console.error('업로드 목록 조회 실패:', error);
      
      let errorMessage = '문의 목록을 불러오는데 실패했습니다.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 업로드 상세 조회
   * 특정 업로드의 상세 정보를 가져옵니다.
   * 
   * @param uploadId 업로드 ID
   * @returns 업로드 상세 조회 성공 여부 및 업로드 상세 정보
   * 
   * @throws {Error} 권한 부족 또는 업로드를 찾을 수 없는 경우
   * 
   * 예시:
   * ```typescript
   * const response = await InquiryService.getUploadDetail(1);
   * if (response.success && response.upload) {
   *   console.log(response.upload.title);
   *   console.log(response.upload.files);
   *   console.log(response.upload.adminResponse);
   * }
   * ```
   */
  static async getUploadDetail(uploadId: number): Promise<UploadDetailResponseType> {
    try {
      const upload = await get<UploadDetailResponse>(`${this.UPLOADS_ENDPOINT}/${uploadId}`);

      return {
        success: true,
        upload,
      };
    } catch (error: any) {
      console.error('업로드 상세 조회 실패:', error);
      
      let errorMessage = '문의사항을 불러오는데 실패했습니다.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 파일 URL 가져오기
   * 파일 ID를 기반으로 파일에 접근할 수 있는 URL을 생성합니다.
   * 
   * @param fileId 파일 ID
   * @returns 파일 URL
   * 
   * 예시:
   * ```typescript
   * const imageUrl = InquiryService.getFileUrl(123);
   * // 결과: "https://api.onsaemiro.site/api/files/123"
   * ```
   */
  static getFileUrl(fileId: number): string {
    return `${API_BASE_URL}/api/files/${fileId}`;
  }

  /**
   * 기존 호환성을 위한 메서드 (문의하기 전송)
   * 
   * @deprecated uploadFiles를 사용하세요.
   * @param message 문의 내용
   * @param imageUri 이미지 URI (선택사항)
   * @returns 업로드 성공 여부
   */
  static async sendInquiry(message: string, imageUri?: string): Promise<UploadResponse> {
    const files: string[] = [];
    
    if (imageUri) {
      files.push(imageUri);
    }

    return this.uploadFiles({
      content: message,
      files,
    });
  }
}

export default InquiryService;