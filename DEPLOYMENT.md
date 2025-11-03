# 프로덕션 배포 가이드

## 🔧 프로덕션 환경 변수

프로덕션 빌드 전에 다음 사항을 확인하고 설정해야 합니다:

### 1. API 서버 URL 설정

`services/api.ts`에서 프로덕션 API URL을 설정하세요:

```typescript
// 프로덕션 환경 변수 설정 방법
// 빌드 시 EXPO_PUBLIC_API_URL 환경 변수를 설정

// 예시:
// EAS 빌드: eas build --profile production --env EXPO_PUBLIC_API_URL=https://api.onsae.com
```

### 2. 주요 환경 변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `EXPO_PUBLIC_API_URL` | 백엔드 API 서버 URL | ✅ 필수 |
| `EXPO_OPTIMIZED` | 프로덕션 최적화 플래그 | 자동 설정 |

### 3. 빌드 전 체크리스트

- [ ] `app.json`의 버전 업데이트
- [ ] API URL을 프로덕션 서버로 변경
- [ ] 앱 아이콘 및 스플래시 스크린 이미지 확인
- [ ] 앱 패키지명 확인 (com.ph9_9.onsaeapp)
- [ ] 앱 이름 확인 ("온새")

