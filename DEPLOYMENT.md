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

### 4. 프로덕션 빌드 명령어

```bash
# 1. 환경 변수와 함께 프로덕션 빌드
eas build --profile production --platform android \
  --env EXPO_PUBLIC_API_URL=https://your-api-domain.com

# 2. 빌드만 하기 (수동 제출)
eas build --profile production --platform android

# 3. 빌드 + 자동 제출
eas submit --profile production --platform android
```

### 5. 개발/프로덕션 환경 전환

#### 개발 환경
```bash
# 로컬 실행
npm start

# Android 에뮬레이터
npm run android
```

#### 프로덕션 빌드
```bash
# 빌드 생성
eas build --profile production --platform android
```

### 6. 현재 설정 정보

**앱 정보 (app.json)**
- 이름: "온새"
- 패키지명: com.ph9_9.onsaeapp
- 버전: 1.0.0
- 스킴: onsaeapp

**EAS 프로젝트 ID**
- projectId: 4c6d80db-c75a-4451-843a-fdb14cda7d67

### 7. 빌드 프로파일 (eas.json)

#### Preview
- 빌드 타입: APK
- 용도: 테스트

#### Production
- 빌드 타입: App Bundle (AAB)
- 제출 대상: Google Play Internal
- 최적화: 자동 활성화

### 8. 주의사항

⚠️ **프로덕션 빌드 전 필수 확인사항:**

1. API URL이 프로덕션 서버를 가리키는지 확인
2. HTTPS를 사용하는지 확인 (HTTP는 프로덕션에서 차단됨)
3. 백엔드 CORS 설정에서 앱 도메인 허용
4. Google Play Console에 앱 서명 키 등록
5. 버전 코드 중복 방지를 위해 버전 업데이트

### 9. 문제 해결

#### 환경 변수가 적용되지 않는 경우
```bash
# 캐시 삭제 후 재빌드
eas build --clear-cache --profile production
```

#### 로컬 테스트
```bash
# 개발 서버 재시작
npm start -- --clear
```

### 10. 배포 후 확인

1. Google Play Console에서 앱 버전 확인
2. 앱 설치 후 로그인 테스트
3. API 연결 테스트
4. 알림 기능 테스트
5. 메인 기능 테스트

