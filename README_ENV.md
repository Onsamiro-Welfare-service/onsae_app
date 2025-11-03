# 환경 변수 설정 가이드

## 프로덕션 빌드를 위한 환경 변수

프로덕션 환경에서 필요한 환경 변수를 설정하는 방법입니다.

### 1. API 서버 URL

현재 `services/api.ts`에서 BASE_URL이 하드코딩되어 있습니다.
프로덕션 빌드 전에 다음을 수정해야 합니다:

**현재 코드 (services/api.ts):**
```typescript
const BASE_URL = Platform.select({
  ios: 'http://localhost:8080',
  android: 'http://192.168.0.3:8080',
  default: 'http://localhost:8080',
}) as string;
```

### 2. 환경 변수로 변경 (권장)

#### a) `.env.production` 파일 생성
```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

#### b) `services/api.ts` 수정
```typescript
const BASE_URL = Platform.select({
  ios: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  android: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.3:8080',
  default: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
}) as string;
```

### 3. 필요한 환경 변수 목록

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `EXPO_PUBLIC_API_URL` | 백엔드 API 서버 URL | `https://api.onsae.com` |
| `EXPO_OPTIMIZED` | 프로덕션 최적화 플래그 | `true` |

### 4. EAS 빌드 설정 (eas.json)

이미 설정되어 있습니다:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_OPTIMIZED": "true"
      }
    }
  }
}
```

### 5. 프로덕션 빌드 명령어

```bash
# 프로덕션 빌드
eas build --profile production --platform android

# 또는 빌드 + 제출
eas submit --profile production --platform android
```

### 6. 안드로이드 패키지명 확인

현재 패키지명: `com.ph9_9.onsaeapp` (app.json에 설정됨)

### 7. 주의사항

1. **API 서버 URL**: 프로덕션에서는 반드시 실제 서버 URL로 변경
2. **HTTPS 필수**: 프로덕션에서는 HTTPS 사용 권장
3. **CORS 설정**: 백엔드에서 모바일 앱 도메인 허용 필요
4. **Google Play Console**: 앱 서명 키 관리 필수
5. **버전 관리**: `app.json`의 version 업데이트 필요

### 8. 환경별 설정 예시

#### 개발 환경 (로컬)
- API URL: `http://192.168.0.3:8080`
- 최적화: `false`

#### 스테이징 환경
- API URL: `https://staging-api.onsae.com`
- 최적화: `true`

#### 프로덕션 환경
- API URL: `https://api.onsae.com`
- 최적화: `true`

