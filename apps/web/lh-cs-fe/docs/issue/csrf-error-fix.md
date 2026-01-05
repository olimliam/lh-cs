## 🔍 에러 해결 원리 분석

- 해당 이슈 경로 : /apps/web/lh-cs-fe/src/shared/api/api-client.ts#L210

### **문제 상황 (수정 전)**

- 사용자가 landing 페이지 진입 시 login 페이지로 강제 리디렉션 되는 상황.

```typescript
// ❌ 이전 코드: CSRF 에러 발생 시 무조건 토큰 갱신 시도
if (
  error.response?.status === 403 &&
  csrfErrorDetection.isCSRFError(error)
) {
  // Public 엔드포인트만 체크
  const publicEndpoints = ['/auth/login', '/auth/register', ...];
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    originalRequest.url?.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return Promise.reject(new ApiError(...)); // 에러 반환
  }

  // ❌ Landing 페이지에서도 handleCSRFRefresh() 실행됨!
  if (isRefreshing) { ... }
  return handleCSRFRefresh(originalRequest);
}
```

**플로우:**

```
1. 사용자가 Landing 페이지 접근
2. Landing에서 API 호출 (예: 공지사항 조회)
3. 서버가 CSRF 토큰 만료로 403 응답
4. Axios interceptor에서 CSRF 에러 감지
5. Landing은 Public 페이지지만 체크 로직 없음 ❌
6. handleCSRFRefresh() 실행 → refreshTokenRequest() 호출
7. Refresh token도 없거나 만료됨 → 갱신 실패
8. tokenStorage.clearTokens() 실행
9. window.location.replace('/login?from=/landing') ❌
10. 사용자가 의도하지 않게 Login 페이지로 강제 이동
```

### **해결 방법 (수정 후)**

```typescript
// ✅ 수정된 코드: Public 페이지 체크 추가
if (
  error.response?.status === 403 &&
  csrfErrorDetection.isCSRFError(error)
) {
  console.log('🚨 CSRF error detected for:', originalRequest.url);

  // ✅ 1. Public 페이지에서는 CSRF 에러를 일반 에러로 처리
  const publicPages = ['/landing', '/login', '/register'];
  const isPublicPage = publicPages.some((page) =>
    window.location.pathname.startsWith(page)
  );

  if (isPublicPage) {
    console.log('ℹ️ CSRF error on public page - no token refresh');
    const message = extractErrorMessage(error.response?.data);

    // ✅ 2. 토큰 갱신 없이 즉시 에러 반환
    return Promise.reject(
      new ApiError(message, {
        status: error.response?.status,
        raw: error.response?.data,
      })
    );
  }

  // ✅ 3. Public 엔드포인트도 체크 (기존 로직 유지)
  const publicEndpoints = ['/auth/login', '/auth/register', ...];
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    originalRequest.url?.includes(endpoint)
  );

  if (isPublicEndpoint) {
    const message = extractErrorMessage(error.response?.data);
    return Promise.reject(new ApiError(message, { ... }));
  }

  // ✅ 4. Protected 페이지에서만 CSRF refresh 시도
  if (isRefreshing) { ... }
  return handleCSRFRefresh(originalRequest);
}
```

**개선된 플로우:**

```
1. 사용자가 Landing 페이지 접근
2. Landing에서 API 호출 (예: 공지사항 조회)
3. 서버가 CSRF 토큰 만료로 403 응답
4. Axios interceptor에서 CSRF 에러 감지
5. ✅ isPublicPage 체크 → '/landing'이므로 true
6. ✅ 토큰 갱신 시도 없이 즉시 ApiError 반환
7. ✅ React Query/SWR이 에러를 처리 (재시도 or 사용자에게 표시)
8. ✅ tokenStorage.clearTokens() 실행 안됨
9. ✅ 리디렉션 발생 안함
10. 사용자는 Landing 페이지에 유지되며 정상적으로 "상담원 로그인" 버튼 클릭 가능
```

## 📊 핵심 차이점 비교

| 구분                                  | 수정 전                          | 수정 후                 |
| ------------------------------------- | -------------------------------- | ----------------------- |
| **Landing CSRF 에러 처리**            | `handleCSRFRefresh()` 호출       | ✅ 즉시 `ApiError` 반환 |
| **토큰 갱신 시도**                    | ❌ 불필요하게 시도               | ✅ 시도 안함            |
| **`tokenStorage.clearTokens()` 실행** | ❌ 실행됨 (불필요)               | ✅ 실행 안됨            |
| **리디렉션 발생**                     | ❌ `/login?from=/landing`        | ✅ 발생 안함            |
| **사용자 경험**                       | ❌ 의도치 않은 페이지 이동       | ✅ Landing에 유지       |
| **상담원 버튼 동작**                  | ⚠️ 이미 Login 페이지라 클릭 불가 | ✅ 정상 클릭 가능       |

## 🧩 왜 이 방법이 효과적인가?

### **1. 인증 컨텍스트 분리**

```typescript
// ✅ 페이지 컨텍스트별 에러 처리 전략
const authenticationStrategies = {
  // Public 페이지: 인증 불필요 → 에러만 반환
  publicPages: ['/landing', '/login', '/register'],

  // Protected 페이지: 인증 필수 → 토큰 갱신 시도
  protectedPages: ['/dashboard', '/counsel', '/settings'],

  // Guest 페이지: 임시 인증 → visitor token 재발급
  guestPages: ['/visitor-auth'],
};
```

**Landing 페이지의 특성:**

- ✅ 로그인 없이 접근 가능 (마케팅 페이지)
- ✅ 일부 API 호출 가능 (예: 공지사항, 배너)
- ❌ 사용자 인증 상태 불필요
- ❌ Access Token / Refresh Token 없음
- ❌ CSRF 토큰 검증 불필요

**문제의 근본 원인:**

```typescript
// ❌ Axios interceptor가 모든 페이지를 동일하게 처리
// Landing에서도 인증 필요 페이지처럼 토큰 갱신 시도
if (error.response?.status === 403) {
  return handleCSRFRefresh(originalRequest); // 무조건 실행
}
```

**해결 방법:**

```typescript
// ✅ 페이지 컨텍스트를 고려한 분기 처리
if (isPublicPage) {
  return Promise.reject(new ApiError(...)); // 에러만 반환
}

if (isProtectedPage) {
  return handleCSRFRefresh(originalRequest); // 토큰 갱신 시도
}
```

### **2. 불필요한 네트워크 요청 제거**

```typescript
// ❌ 수정 전: Landing에서 CSRF 에러 발생 시
const handleCSRFRefresh = async (originalRequest) => {
  try {
    // ❌ refreshTokenRequest() 호출 → 불필요한 네트워크 요청
    const tokenData = await refreshTokenRequest();
    // ...
  } catch (refreshError) {
    // ❌ 당연히 실패 (Landing은 refresh token 없음)
    tokenStorage.clearTokens();
    window.location.replace('/login?from=/landing');
  }
};
```

**네트워크 요청 비교:**

| 상황                      | 수정 전                            | 수정 후                  |
| ------------------------- | ---------------------------------- | ------------------------ |
| Landing에서 공지사항 조회 | GET `/api/notices` → 403           | GET `/api/notices` → 403 |
| CSRF 에러 감지            | ✅                                 | ✅                       |
| Refresh token 요청        | ❌ POST `/auth/refresh` → 401/400  | ⚠️ **요청 안함**         |
| 원본 요청 재시도          | ❌ (refresh 실패로 중단)           | ⚠️ **재시도 안함**       |
| 리디렉션                  | ❌ `/login?from=/landing`          | ⚠️ **리디렉션 안함**     |
| **총 HTTP 요청 수**       | 3회 (notices + refresh + redirect) | **1회 (notices만)**      |
| **불필요한 요청**         | 2회 (refresh, redirect)            | **0회**                  |

**효과:**

- 🟢 네트워크 요청 **66% 감소**
- 🟢 서버 부하 감소 (불필요한 refresh 요청 제거)
- 🟢 클라이언트 처리 시간 단축 (토큰 갱신 로직 스킵)

### **3. 토큰 저장소 무결성 유지**

```typescript
// ❌ 수정 전: Landing에서 CSRF 에러 시
const handleCSRFRefresh = async (originalRequest) => {
  try {
    const tokenData = await refreshTokenRequest(); // 실패
  } catch (refreshError) {
    // ❌ Landing에 남아있던 이전 세션의 토큰까지 삭제
    tokenStorage.clearTokens(); // localStorage.removeItem('accessToken')
    window.location.replace('/login?from=/landing');
  }
};
```

**시나리오:**

```
1. 사용자 A가 로그인 → 토큰 저장 (localStorage)
2. 사용자 A가 로그아웃 (명시적 로그아웃은 안하고 탭만 닫음)
3. localStorage에 만료된 토큰 잔존
4. 나중에 다시 브라우저 열고 Landing 접근
5. Landing에서 공지사항 조회 → 서버가 만료된 토큰 확인 → 403 응답
6. ❌ handleCSRFRefresh() → clearTokens() 실행
7. ❌ 이전 세션의 토큰까지 강제 삭제
8. ❌ /login으로 리디렉션
```

**문제점:**

- Landing은 **익명 사용자**도 접근 가능한 페이지
- 이전 세션의 만료된 토큰이 있어도 **Landing 이용에 영향 없어야 함**
- 하지만 CSRF 에러 처리 로직이 **토큰을 강제 삭제**하고 **Login으로 리디렉션**

**해결:**

```typescript
// ✅ 수정 후: Public 페이지에서는 토큰 처리 안함
if (isPublicPage) {
  console.log('ℹ️ CSRF error on public page - no token refresh');

  // ✅ tokenStorage.clearTokens() 실행 안함
  // ✅ window.location.replace() 실행 안함

  return Promise.reject(new ApiError(message, { ... }));
}
```

**효과:**

- 🟢 이전 세션의 토큰이 localStorage에 남아있어도 무방
- 🟢 사용자가 "상담원 로그인" 버튼 클릭 시 `handleCounselorClick()`에서
  명시적으로 `clearTokens()` 실행
- 🟢 토큰 저장소 관리 책임이 **각 페이지의 비즈니스 로직**으로 이동

### **4. 사용자 플로우 개선**

```
[수정 전 플로우 - 문제 상황]

Landing 페이지 접근
  ↓
공지사항 API 호출 → 403 CSRF Error
  ↓
❌ handleCSRFRefresh() 실행
  ↓
❌ refreshTokenRequest() 실패
  ↓
❌ tokenStorage.clearTokens()
  ↓
❌ window.location.replace('/login?from=/landing')
  ↓
Login 페이지로 강제 이동
  ↓
⚠️ 사용자는 왜 Login 페이지에 왔는지 모름
⚠️ 뒤로 가기 버튼 눌러도 Landing → Login 무한 루프 가능
```

```
[수정 후 플로우 - 정상 동작]

Landing 페이지 접근
  ↓
공지사항 API 호출 → 403 CSRF Error
  ↓
✅ isPublicPage 체크 → true
  ↓
✅ ApiError 반환 (토큰 갱신 시도 안함)
  ↓
React Query/SWR이 에러 처리
  - onError: 사용자에게 토스트 메시지 표시 (선택)
  - retry: false (공지사항 없어도 Landing 이용 가능)
  ↓
✅ 사용자는 Landing 페이지에 유지됨
  ↓
사용자가 "상담원 로그인" 버튼 클릭
  ↓
handleCounselorClick() 실행
  ↓
✅ tokenStorage.clearTokens() (만료된 토큰 명시적 제거)
  ↓
navigate('/login') (의도적인 페이지 이동)
  ↓
Login 페이지 진입 (정상적인 플로우)
```

## 🔬 코드 레벨 동작 분석

### **CSRF 에러 발생 시점**

```typescript
// 1. Landing 페이지에서 API 호출
const { data: notices } = useQuery({
  queryKey: ['notices'],
  queryFn: () => api.get('/api/notices'),
});

// 2. Axios가 요청 전송
// Request Interceptor
client.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken(); // null 또는 만료된 토큰

  // Landing에서 호출하는 /api/notices는 public endpoint 아님
  // → accessToken이 있으면 헤더에 추가
  if (accessToken && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config; // 요청 전송
});

// 3. 서버 응답 (NestJS @UseGuards(EnhancedAuthGuard))
// apps/api/lh-cs-be/src/presentation/guards/enhanced-auth.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const csrfToken = request.cookies['CSRF-TOKEN'];

  // ❌ CSRF 토큰 만료 또는 누락
  if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
    throw new ForbiddenException({
      code: 'CSRF_TOKEN_INVALID',
      message: 'CSRF token is invalid or expired',
    });
  }

  // ...existing validation...
}

// 4. Axios Response Interceptor에서 에러 감지
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // error.response.status === 403
    // error.response.data.code === 'CSRF_TOKEN_INVALID'

    // ✅ 수정 후: isPublicPage 체크
    const isPublicPage = ['/landing', '/login', '/register'].some((page) =>
      window.location.pathname.startsWith(page)
    );

    if (isPublicPage) {
      // ✅ 즉시 에러 반환 (handleCSRFRefresh 호출 안함)
      return Promise.reject(new ApiError('CSRF token expired', { ... }));
    }

    // Protected 페이지에서만 토큰 갱신 시도
    return handleCSRFRefresh(originalRequest);
  }
);

// 5. React Query가 에러 처리
const { data: notices, error } = useQuery({
  queryKey: ['notices'],
  queryFn: () => api.get('/api/notices'),
  onError: (error) => {
    // ✅ ApiError 수신 (CSRF token expired)
    console.error('Failed to load notices:', error.message);

    // 선택: 사용자에게 메시지 표시
    // toast.showError('공지사항을 불러오는데 실패했습니다.');
  },
  retry: false, // CSRF 에러는 재시도 불필요
});
```

### **Protected 페이지에서의 동작 (비교)**

```typescript
// Dashboard 페이지에서 CSRF 에러 발생 시

// 1. API 호출
const { data: counsels } = useQuery({
  queryKey: ['counsels'],
  queryFn: () => api.get('/api/counsels'),
});

// 2. 서버 응답: 403 CSRF_TOKEN_INVALID

// 3. Response Interceptor
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const isPublicPage = ['/landing', '/login', '/register'].some((page) =>
      window.location.pathname.startsWith(page)
    );

    if (isPublicPage) {
      // ⚠️ /dashboard는 public page 아님 → 이 블록 스킵
    }

    // ✅ Protected 페이지에서는 CSRF refresh 시도
    if (isRefreshing) {
      // 대기열에 추가 (동시 요청 처리)
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => client(originalRequest));
    }

    // ✅ handleCSRFRefresh 실행
    return handleCSRFRefresh(originalRequest);
  }
);

// 4. handleCSRFRefresh 실행
const handleCSRFRefresh = async (originalRequest) => {
  try {
    // ✅ refreshTokenRequest 호출 (Dashboard는 로그인 상태)
    const tokenData = await refreshTokenRequest();

    // ✅ 새 토큰 저장
    tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);

    // ✅ 원본 요청 재시도 (새 CSRF 토큰은 쿠키로 자동 적용)
    originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
    return client(originalRequest);
  } catch (refreshError) {
    // ❌ Refresh 실패 시 로그아웃
    tokenStorage.clearTokens();
    window.location.replace('/login?from=/dashboard');
  }
};

// 5. 결과
// ✅ CSRF 토큰 갱신 성공 → /api/counsels 재시도 성공
// 또는
// ❌ Refresh 실패 → /login?from=/dashboard 리디렉션
```

## 📋 에러 해결 체크리스트

수정된 코드가 다음을 만족하는지 확인하세요:

- [x] Landing 페이지에서 CSRF 에러 발생 시 `/login`으로 리디렉션 안됨
- [x] Landing 페이지에서 `tokenStorage.clearTokens()` 실행 안됨
- [x] Landing 페이지에서 `refreshTokenRequest()` 호출 안됨 (불필요한 네트워크
      요청 제거)
- [x] Public 엔드포인트(`/auth/login`, `/auth/register`)는 기존 로직 유지
- [x] Protected 페이지(`/dashboard`, `/counsel`)에서는 여전히 CSRF refresh 시도
- [x] `isPublicPage` 체크가 `isPublicEndpoint` 체크보다 **먼저** 실행됨 (조기
      반환 최적화)
- [x] 콘솔 로그(`ℹ️ CSRF error on public page - no token refresh`)로 디버깅 가능
- [x] `ApiError` 객체 반환으로 React Query/SWR과 호환

## 🎯 핵심 요약

### **왜 에러가 해결되었는가?**

1. **페이지 컨텍스트 인식**: Landing을 Public 페이지로 분류하여 인증 불필요
   페이지 처리
2. **불필요한 토큰 갱신 제거**: Landing에서 CSRF 에러 발생 시
   `refreshTokenRequest()` 호출 안함
3. **토큰 저장소 보호**: `tokenStorage.clearTokens()` 실행 안함으로 이전 세션
   토큰 유지
4. **리디렉션 방지**: `window.location.replace()` 호출 안함으로 사용자 플로우
   유지
5. **조기 반환 최적화**: `if (isPublicPage)` 체크로 불필요한 로직 스킵

### **코드 한 줄로 요약**

```typescript
// ✅ 이 한 블록이 모든 문제를 해결
if (isPublicPage) {
  console.log('ℹ️ CSRF error on public page - no token refresh');
  return Promise.reject(new ApiError(message, { ... }));
}
```

### **프로젝트 가이드라인 준수**

- ✅ **FSD 아키텍처**: api-client.ts에 공통 로직 배치
- ✅ **Layered Architecture**: Axios interceptor(Presentation) →
  tokenStorage(Infrastructure) 단방향 의존성
- ✅ **kebab-case**: 파일명
  [`apps/web/lh-cs-fe/src/shared/api/api-client.ts`]api-client.ts ) 준수
- ✅ **TypeScript 안전성**: `AxiosError`, `InternalAxiosRequestConfig` 타입 활용
- ✅ **보안 규칙**: Public/Protected 페이지 분리, CSRF 토큰 쿠키 기반 관리
- ✅ **사용자 경험**: 불필요한 리디렉션 제거, 명확한 에러 메시지

## 📚 참고 자료

- [Axios Interceptors - Official Docs](https://axios-http.com/docs/interceptors)
- [CSRF Protection Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-functions#handling-and-throwing-errors)
- [NestJS Guards - ExecutionContext](https://docs.nestjs.com/guards#execution-context)

## 🎉 결론

**에러 해결 핵심:**

Landing 페이지는 **인증 불필요 페이지**이므로, CSRF 에러 발생 시 **토큰 갱신을
시도하지 않고 즉시 에러를 반환**하여:

1. 🟢 불필요한 네트워크 요청 **66% 감소** (refresh + redirect 제거)
2. 🟢 토큰 저장소 무결성 유지 (`clearTokens()` 실행 안함)
3. 🟢 사용자 플로우 유지 (Landing → Login 강제 이동 방지)
4. 🟢 비즈니스 로직 명확화 (상담원 버튼 클릭 시 명시적 토큰 제거)

**한 줄 정리:**

> **"Public 페이지에서는 인증 에러를 무시하고, Protected 페이지에서만 토큰
> 갱신을 시도한다"**

이로써 Landing → 상담원 버튼 → Login 플로우가 정상 동작하며, AGENTS.md의
보안·설정 가이드라인과 FSD 아키텍처 원칙을 준수합니다! 🚀
