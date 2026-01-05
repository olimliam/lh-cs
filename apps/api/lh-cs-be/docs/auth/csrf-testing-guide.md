# CSRF 보안 로직 테스트 가이드

## 🚀 테스트 환경 준비

1. **백엔드 서버 실행**

```bash
cd apps/api/lh-cs-be
pnpm run start:dev
```

2. **서버 확인**

```bash
curl http://localhost:8080/
```

## 🔒 CSRF 보안 테스트 시나리오

### 1. 로그인 및 CSRF 토큰 획득

```bash
# 로그인 요청
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

**예상 응답:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "csrfToken": "YWRtaW46MTY0MDk5NTIwMDpjc3JmLXRva2VuLWVhZGNhZGE...",
    "user": {
      "id": 1,
      "email": "admin@test.com",
      "name": "Admin User"
    }
  }
}
```

### 2. GET 요청 테스트 (CSRF 토큰 불필요)

```bash
# 토큰을 변수로 저장
ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"

# GET 요청 (CSRF 토큰 없이)
curl -X GET http://localhost:8080/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**예상 결과:** ✅ 성공 (200 OK)

### 3. POST 요청 테스트 (CSRF 토큰 없이) - 실패 예상

```bash
# POST 요청 (CSRF 토큰 없이)
curl -X POST http://localhost:8080/api/v1/consultations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": 1,
    "maxParticipants": 10
  }'
```

**예상 결과:** ❌ 실패 (403 Forbidden)

```json
{
  "statusCode": 403,
  "message": "CSRF token is required"
}
```

### 4. POST 요청 테스트 (잘못된 CSRF 토큰) - 실패 예상

```bash
# POST 요청 (잘못된 CSRF 토큰)
curl -X POST http://localhost:8080/api/v1/consultations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-CSRF-Token: invalid-csrf-token" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": 1,
    "maxParticipants": 10
  }'
```

**예상 결과:** ❌ 실패 (403 Forbidden)

```json
{
  "statusCode": 403,
  "message": "Invalid CSRF token"
}
```

### 5. POST 요청 테스트 (올바른 CSRF 토큰) - 성공 예상

```bash
# 토큰을 변수로 저장
CSRF_TOKEN="YOUR_CSRF_TOKEN_HERE"

# POST 요청 (올바른 CSRF 토큰)
curl -X POST http://localhost:8080/api/v1/consultations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": 1,
    "maxParticipants": 10
  }'
```

**예상 결과:** ✅ 성공 (201 Created)

### 6. PUT 요청 테스트 (관리자 기능)

```bash
# PUT 요청 (CSRF 토큰 없이) - 실패 예상
curl -X PUT http://localhost:8080/admin/users/1/status \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'

# PUT 요청 (올바른 CSRF 토큰) - 성공 예상
curl -X PUT http://localhost:8080/admin/users/1/status \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'
```

### 7. 토큰 리프레시 테스트

```bash
# 토큰 리프레시
REFRESH_TOKEN="YOUR_REFRESH_TOKEN_HERE"

curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**확인사항:**

- 새로운 `accessToken` 발급됨
- 새로운 `csrfToken` 발급됨 (이전과 다른 값)

## 📊 테스트 결과 확인

### ✅ 성공 케이스

- GET 요청 (CSRF 토큰 없이): 200 OK
- POST/PUT 요청 (올바른 CSRF 토큰): 201/200 OK
- 토큰 리프레시: 새로운 CSRF 토큰 발급

### ❌ 실패 케이스

- POST/PUT 요청 (CSRF 토큰 없이): 403 Forbidden
- POST/PUT 요청 (잘못된 CSRF 토큰): 403 Forbidden
- Authorization 헤더 없이 요청: 403 Forbidden

## 🛠️ 추가 테스트 방법

### Postman을 사용한 테스트

1. Collection 생성
2. Environment 변수 설정 (accessToken, csrfToken)
3. Pre-request Script로 토큰 자동 설정

### 브라우저 개발자 도구 테스트

1. 로그인 후 Network 탭 확인
2. XHR 요청에서 `X-CSRF-Token` 헤더 확인
3. localStorage에서 토큰 저장 확인

### 프론트엔드 통합 테스트

1. 브라우저에서 로그인
2. 관리자 기능 사용 (사용자 상태 변경 등)
3. Network 탭에서 CSRF 헤더 전송 확인

## 🔍 디버깅 팁

### 서버 로그 확인

```bash
# 서버 콘솔에서 CSRF 검증 로그 확인
# CsrfGuard에서 발생하는 에러 메시지 확인
```

### 토큰 디코딩

```bash
# Base64 디코딩으로 CSRF 토큰 구조 확인
echo "YOUR_CSRF_TOKEN" | base64 -d
```

### JWT 디코딩

```bash
# JWT 페이로드 확인 (jwt.io 사용)
# sessionId 생성 로직 확인
```
