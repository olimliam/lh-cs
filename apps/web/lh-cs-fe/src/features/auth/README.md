# Auth React Query 사용 가이드

## 설치 및 설정

React Query가 이미 설치되어 있고, `main.tsx`에 `QueryClientProvider`가 설정되어
있습니다.

## 사용 가능한 Hooks

### 1. useAuth() - 현재 인증 상태 확인

```typescript
import { useAuth } from '@/features/auth';

const MyComponent = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) return <div>로딩중...</div>;
  if (!isAuthenticated) return <div>로그인이 필요합니다</div>;

  return <div>안녕하세요, {user?.name}님!</div>;
};
```

### 2. useLoginFormQuery() - 로그인 폼에서 사용

```typescript
import { useLoginFormQuery } from '@/features/auth';

const LoginForm = () => {
  const { login, isLoading, error, reset } = useLoginFormQuery();

  const handleSubmit = async (credentials) => {
    const result = await login(credentials);

    if (result.success) {
      // 로그인 성공
      console.log('로그인 성공:', result.data);
    } else {
      // 로그인 실패
      console.log('에러:', result.error);
    }
  };

  return (
    // 폼 컴포넌트
  );
};
```

### 3. useLogout() - 로그아웃

```typescript
import { useLogout } from '@/features/auth';

const Header = () => {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <button onClick={handleLogout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
};
```

### 4. useProfile() - 사용자 프로필 조회

```typescript
import { useProfile } from '@/features/auth';

const ProfilePage = () => {
  const { data: user, isLoading, error } = useProfile();

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <p>역할: {user?.role}</p>
    </div>
  );
};
```

### 5. useRefreshToken() - 토큰 갱신

```typescript
import { useRefreshToken } from '@/features/auth';

const MyComponent = () => {
  const refreshMutation = useRefreshToken();

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <button onClick={handleRefresh} disabled={refreshMutation.isPending}>
      토큰 갱신
    </button>
  );
};
```

## API 직접 사용

```typescript
import { authApi, tokenStorage } from '@/features/auth';

// 직접 API 호출
const loginResult = await authApi.login({
  email: 'user@example.com',
  password: 'password',
});

// 토큰 관리
const accessToken = tokenStorage.getAccessToken();
const refreshToken = tokenStorage.getRefreshToken();
tokenStorage.setTokens(newAccessToken, newRefreshToken);
tokenStorage.clearTokens();
```

## 타입 정의

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
```

## 백엔드 API 엔드포인트

- POST `/api/v1/auth/login` - 로그인
- POST `/api/v1/auth/logout` - 로그아웃
- POST `/api/v1/auth/logout-all` - 전체 세션 로그아웃
- POST `/api/v1/auth/refresh` - 토큰 갱신
- GET `/api/v1/user/profile` - 프로필 조회
- POST `/api/v1/auth/register` - 회원가입

## 주의사항

1. **토큰 자동 관리**: 로그인/토큰 갱신 시 Access Token은 브라우저 메모리에만
   저장되고 Refresh/CSRF 토큰은 HttpOnly 쿠키로 관리됩니다.
2. **자동 로그아웃**: 토큰이 만료되거나 401 에러 발생 시 자동으로
   로그아웃됩니다.
3. **쿼리 캐싱**: 프로필 데이터는 5분간 캐시됩니다.
4. **에러 처리**: 네트워크 에러나 서버 에러는 자동으로 처리됩니다.

## 테스트 계정

개발용 테스트 계정:

- 이메일: `lhadmin@example.com`
- 비밀번호: `password`
