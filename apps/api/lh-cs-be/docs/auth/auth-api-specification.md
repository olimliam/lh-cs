# 인증 API 명세서

## 개요

JWT 기반 Access Token과 Refresh Token을 사용하는 인증 시스템의 API 명세입니다.

## 기본 정보

- Base URL: `/api/v1`
- Content-Type: `application/json`
- Authorization: `Bearer {access_token}`

## 인증 관련 API

### 1. 회원가입

```
POST /auth/register
```

#### Request Body

```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "SecurePass12#$",
  "confirmPassword": "SecurePass12#$"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "회원가입 신청이 완료되었습니다. 승인 후 이용이 가능합니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "hong@example.com",
      "name": "홍길동",
      "role": "USER",
      "status": "ACTIVE"
    }
  }
}
```

#### Error Responses

```json
// 400 Bad Request - 이메일 중복
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS"
}

// 400 Bad Request - 비밀번호 불일치
{
  "success": false,
  "message": "Password confirmation does not match",
  "errorCode": "PASSWORD_MISMATCH"
}

// 400 Bad Request - 유효성 검사 실패
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### 2. 로그인

```
POST /auth/login
```

#### Request Body

```json
{
  "email": "hong@example.com",
  "password": "SecurePass12#$"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "hong@example.com",
      "name": "홍길동",
      "role": "USER",
      "status": "ACTIVE",
      "lastLoginAt": "2024-08-26T10:30:00Z"
    }
  }
}
```

#### Error Responses

```json
// 401 Unauthorized - 잘못된 인증 정보
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "INVALID_CREDENTIALS"
}

// 401 Unauthorized - 계정 잠김
{
  "success": false,
  "message": "Account is locked. Try again later.",
  "errorCode": "ACCOUNT_LOCKED",
  "lockedUntil": "2024-08-26T11:00:00Z"
}

// 401 Unauthorized - 계정 비활성화
{
  "success": false,
  "message": "Account is inactive or suspended",
  "errorCode": "ACCOUNT_INACTIVE"
}
```

### 3. 토큰 재발급

```
POST /auth/refresh
```

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "hong@example.com",
      "name": "홍길동",
      "role": "USER"
    }
  }
}
```

#### Error Responses

```json
// 401 Unauthorized - 유효하지 않은 refresh token
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "errorCode": "INVALID_REFRESH_TOKEN"
}
```

### 4. 로그아웃

```
POST /auth/logout
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 5. 전체 세션 로그아웃

모든 디바이스/브라우저에서 해당 사용자를 강제로 로그아웃시킵니다.

- 모든 refresh token이 무효화됩니다
- 모든 활성 세션이 종료됩니다
- 보안 위험 상황이나 의심스러운 활동 감지 시 사용

```
POST /auth/logout-all
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "All sessions logged out successfully"
}
```

#### Error Responses

```json
// 401 Unauthorized - 유효하지 않은 access token
{
  "success": false,
  "message": "Invalid or expired access token",
  "errorCode": "INVALID_TOKEN"
}
```

## 사용자 관리 API

### 6. 내 프로필 조회

```
GET /users/profile
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "role": "USER",
    "status": "ACTIVE",
    "profileImageUrl": "https://example.com/profile/1.jpg",
    "lastLoginAt": "2024-08-26T10:30:00Z",
    "createdAt": "2024-08-01T09:00:00Z",
    "updatedAt": "2024-08-26T10:30:00Z"
  }
}
```

### 7. 내 프로필 수정

```
PUT /users/profile
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "name": "홍길동",
  "profileImageUrl": "https://example.com/profile/new.jpg"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "profileImageUrl": "https://example.com/profile/new.jpg",
    "updatedAt": "2024-08-26T11:00:00Z"
  }
}
```

### 8. 비밀번호 변경

```
POST /users/change-password
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "currentPassword": "OldPass12#$",
  "newPassword": "NewPass12#$",
  "confirmPassword": "NewPass12#$"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - 현재 비밀번호 불일치
{
  "success": false,
  "message": "Current password is incorrect",
  "errorCode": "INVALID_CURRENT_PASSWORD"
}

// 400 Bad Request - 새 비밀번호 확인 불일치
{
  "success": false,
  "message": "New password confirmation does not match",
  "errorCode": "PASSWORD_MISMATCH"
}
```

### 9. 내 세션 조회

현재 사용자의 모든 활성 세션을 조회합니다.

```
GET /users/sessions
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "loginAt": "2024-08-26T10:30:00Z",
        "logoutAt": null,
        "isCurrent": true
      },
      {
        "id": 2,
        "ipAddress": "192.168.1.200",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        "loginAt": "2024-08-25T14:20:00Z",
        "logoutAt": null,
        "isCurrent": false
      }
    ],
    "totalSessions": 2,
    "activeSessions": 2
  }
}
```

### 10. 계정 삭제

```
DELETE /users/account
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "password": "SecurePass12#$",
  "confirmDeletion": true
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - 비밀번호 불일치
{
  "success": false,
  "message": "Invalid password",
  "errorCode": "INVALID_PASSWORD"
}

// 400 Bad Request - 삭제 확인 없음
{
  "success": false,
  "message": "Account deletion must be confirmed",
  "errorCode": "DELETION_NOT_CONFIRMED"
}
```

## 관리자 API

### 11. 사용자 목록 조회

```
GET /admin/users
Authorization: Bearer {access_token}
Role: ADMIN
```

#### Query Parameters

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 10)
- `status`: 사용자 상태 필터 (ACTIVE, INACTIVE, SUSPENDED)
- `role`: 사용자 역할 필터 (ADMIN, USER)
- `username`: 아이디 검색 (부분 일치)
- `name`: 이름 검색 (부분 일치)
- `department`: 부서 검색 (부분 일치)

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "hong@example.com",
        "name": "홍길동",
        "role": "USER",
        "status": "ACTIVE",
        "lastLoginAt": "2024-08-26T10:30:00Z",
        "createdAt": "2024-08-01T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 11-1. 부서 목록 조회

```
GET /admin/users/departments
Authorization: Bearer {access_token}
Role: ADMIN
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "departments": ["개발팀", "영업팀", "운영팀"]
  }
}
```

### 12. 특정 사용자 조회

```
GET /admin/users/{userId}
Authorization: Bearer {access_token}
Role: ADMIN
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "role": "USER",
    "status": "ACTIVE",
    "profileImageUrl": "https://example.com/profile/1.jpg",
    "lastLoginAt": "2024-08-26T10:30:00Z",
    "loginAttemptCount": 0,
    "lockedUntil": null,
    "createdAt": "2024-08-01T09:00:00Z",
    "updatedAt": "2024-08-26T10:30:00Z",
    "sessions": [
      {
        "id": 1,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "loginAt": "2024-08-26T10:30:00Z",
        "logoutAt": null
      }
    ]
  }
}
```

### 13. 사용자 상태 변경

```
PUT /admin/users/{userId}/status
Authorization: Bearer {access_token}
Role: ADMIN
```

#### Request Body

```json
{
  "status": "SUSPENDED",
  "reason": "Policy violation"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "status": "SUSPENDED",
    "updatedAt": "2024-08-26T11:00:00Z"
  }
}
```

### 14. 사용자 삭제 (관리자)

```
DELETE /admin/users/{userId}
Authorization: Bearer {access_token}
Role: ADMIN
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 토큰 정보

### Access Token

- **형식**: JWT (JSON Web Token)
- **만료시간**: 15분
- **용도**: API 인증, 권한 확인
- **저장**: 메모리 또는 보안 저장소
- **갱신**: Refresh Token으로 갱신

### Refresh Token

- **형식**: JWT (JSON Web Token)
- **만료시간**: 7일
- **용도**: Access Token 갱신
- **저장**: HttpOnly 쿠키 또는 보안 저장소
- **무효화**: 로그아웃 시 즉시 무효화

### JWT Payload 구조

#### Access Token

```json
{
  "sub": "1", // 사용자 ID
  "email": "user@example.com",
  "role": "USER",
  "iat": 1630000000, // 발급 시간
  "exp": 1630000900 // 만료 시간 (15분 후)
}
```

#### Refresh Token

```json
{
  "sub": "1", // 사용자 ID
  "type": "refresh", // 토큰 타입
  "jti": "abc123...", // JWT ID (무효화용)
  "iat": 1630000000, // 발급 시간
  "exp": 1630604800 // 만료 시간 (7일 후)
}
```

## 환경 설정

### 필수 환경 변수

```bash
# JWT 설정
JWT_ACCESS_SECRET=your-super-secret-access-key-here-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=your-database-name

# 서버 설정
PORT=8080
NODE_ENV=development

# 보안 설정
BCRYPT_SALT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME_MINUTES=30
```

### 보안 권장사항

1. **JWT Secret 키**

   - 최소 32자 이상의 강력한 랜덤 문자열 사용
   - Access와 Refresh Token에 서로 다른 키 사용
   - 프로덕션에서는 환경 변수로 관리

2. **토큰 저장**

   - Access Token: 메모리 또는 sessionStorage
   - Refresh Token: HttpOnly 쿠키 권장

3. **네트워크 보안**

   - HTTPS 필수 사용
   - CORS 설정 적절히 구성
   - Rate Limiting 적용

4. **계정 보안**
   - 비밀번호 복잡성 검증
   - 로그인 시도 제한
   - 계정 잠금 기능

## 공통 에러 응답

### 인증/인가 에러

```json
// 401 Unauthorized - 토큰 없음
{
  "success": false,
  "message": "Access token is required",
  "errorCode": "TOKEN_REQUIRED"
}

// 401 Unauthorized - 유효하지 않은 토큰
{
  "success": false,
  "message": "Invalid or expired access token",
  "errorCode": "INVALID_TOKEN"
}

// 403 Forbidden - 권한 없음
{
  "success": false,
  "message": "Insufficient permissions",
  "errorCode": "INSUFFICIENT_PERMISSIONS"
}
```

### 일반 에러

```json
// 404 Not Found
{
  "success": false,
  "message": "Resource not found",
  "errorCode": "NOT_FOUND"
}

// 429 Too Many Requests
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errorCode": "RATE_LIMIT_EXCEEDED"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error",
  "errorCode": "INTERNAL_ERROR"
}
```

## 보안 헤더

### 요청 헤더

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Request-ID: uuid-v4-string (선택적)
```

### 응답 헤더

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1630000000
X-Request-ID: uuid-v4-string
```

## 상태 코드 정리

| HTTP 상태 코드 | 설명           |
| -------------- | -------------- |
| 200            | 성공           |
| 201            | 생성 성공      |
| 400            | 잘못된 요청    |
| 401            | 인증 실패      |
| 403            | 권한 없음      |
| 404            | 리소스 없음    |
| 429            | 요청 횟수 초과 |
| 500            | 서버 오류      |

## 사용 예제

### JavaScript/TypeScript 클라이언트 예제

```typescript
class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // 로그인
  async login(email: string, password: string) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      localStorage.setItem('refreshToken', this.refreshToken);
    }
    return data;
  }

  // 토큰 갱신
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      localStorage.setItem('refreshToken', this.refreshToken);
    }
    return data;
  }

  // API 호출 (자동 토큰 갱신)
  async apiCall(url: string, options: RequestInit = {}) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  }

  // 로그아웃
  async logout() {
    if (this.refreshToken) {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }

    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }
}
```

### cURL 예제

```bash
# 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 토큰 갱신
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# 인증이 필요한 API 호출
curl -X GET http://localhost:8080/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 로그아웃
curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```
