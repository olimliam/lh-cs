# LH 내집속속 메타버스 상담 플렛폼

## 프로젝트 배포 현황

- [개발 환경](https://lh-cs-fe.web.elypecs.com)
- [운영 환경(미정)]

### 로그인 정보

- [개발 환경](https://lh-cs-fe.web.elypecs.com)
  - Admin 계정 (Swagger에 정보 있음)
    - ID: 123456
    - PWD:SecurePass12#$

## 개발 문서

- [Swagger](https://lh-cs.dev-api.elypecs.com/api-docs)

## 📋 **프로젝트 구조**

```
apps/
├── api/lh-cs-be/          # NestJS 백엔드 API
├── web/lh-cs-fe/          # React 프론트엔드
packages/
├── shared/                # 공통 라이브러리
├── traveler/              # 투어 관리 패키지
docs/                      # 프로젝트 문서
├── database-id-naming-convention.md  # 🆔 ID 네이밍 규칙
├── deployment/            # 배포 관련 문서
└── security/              # 보안 문서 (KCMVP)
```

## 🆔 **데이터베이스 ID 네이밍 규칙**

이 프로젝트는 통일된 ID 네이밍 규칙을 따릅니다:

- **Primary Key**: 모든 테이블에서 `id` 사용
- **Foreign Key**: `{참조테이블명}_id` 형식 (예: `user_id`, `tour_id`)
- **복합 참조**: `{목적}_{참조테이블명}_id` 형식

자세한 내용은
[database-id-naming-convention.md](docs/database-id-naming-convention.md) 참조

## 🔒 **보안 표준**

- **KCMVP** 검증 암호모듈 기준 비밀번호 암호화
- **PBKDF2-HMAC-SHA256** 310,000 반복
- 공공기관 보안 요구사항 100% 준수

자세한 내용은 [docs/security/](docs/security/) 참조

## 🧪 **E2E 테스트 가이드**

이 프로젝트는 Playwright를 사용한 종단간(End-to-End) 테스트를 지원합니다.

### 📋 **테스트 시나리오**

현재 구현된 주요 테스트 시나리오:

- **로그인/인증 플로우** - 사용자 로그인, 로그아웃, 세션 관리
- **상담실 생성** - 44m² 평형 선택, 유지보수 설비 선택, 상담실 생성
- **대시보드 네비게이션** - 메인 네비게이션, 사용자 프로필, 로그아웃

### 🚀 **테스트 실행 방법**

#### 사전 준비

```bash
# 1. 백엔드 서버 실행 (8080 포트)
cd apps/api/lh-cs-be
pnpm start:local

# 2. 프론트엔드 서버 실행 (8888 포트)
cd apps/web/lh-cs-fe
pnpm dev
```

#### 테스트 실행

```bash
# 기본 테스트 실행
pnpm test:e2e

# HTML 리포트와 함께 실행 (추천)
pnpm test:e2e:report

# 재시도 포함 회귀 테스트
pnpm test:e2e:regression

# 리포트만 확인
pnpm test:report
```

### 📊 **테스트 결과 확인**

테스트 실행 후 생성되는 파일들:

- **playwright-report/**: HTML 테스트 리포트 (브라우저에서 확인)
- **test-results/**: 스크린샷, 비디오, 트레이스 파일 (자동 관리됨)

### 🎯 **테스트 계정**

E2E 테스트용 기본 계정:

- **이메일**: user@example.com
- **비밀번호**: SecurePass12#$

### 📁 **테스트 파일 구조**

```
tests/e2e/
├── login.spec.ts                                      # 로그인/인증 테스트
├── dashboard-navigation.spec.ts                       # 대시보드/네비게이션 테스트
├── consultation-room-creation-new-modal-structure.ts  # 상담실 생성 테스트
└── playwright.config.ts                              # Playwright 설정
```

### ⚙️ **테스트 설정**

주요 설정 사항 (`playwright.config.ts`):

- **Base URL**: http://localhost:8888
- **브라우저**: Chromium (헤드리스 모드 비활성화)
- **뷰포트**: 1280x720
- **스크린샷**: 실패 시에만 저장
- **비디오**: 실패 시에만 저장
- **트레이스**: 재시도 시에만 수집

### 🔍 **안정적인 선택자 사용**

테스트에서 사용하는 선택자 우선순위:

1. **텍스트 기반**: `getByText("로그인")`, `getByText("상담실 개설하기")`
2. **역할 기반**: `getByRole('button')`, `getByRole('heading')`
3. **레이블 기반**: `getByLabel("이메일")`, `getByPlaceholder("상담 코드")`
4. **타입 기반**: `input[type="email"]`, `input[type="password"]`
5. **CSS 클래스**: 가능한 피하기 (변경 가능성 높음)

### 🐛 **디버깅 팁**

테스트 실패 시 디버깅 방법:

1. **HTML 리포트 확인**: `pnpm test:report`
2. **스크린샷 확인**: `test-results/` 폴더
3. **헤드풀 모드 실행**: 브라우저를 보면서 테스트 관찰
4. **콘솔 로그 확인**: 테스트 실행 중 출력되는 로그

### 📝 **테스트 작성 가이드**

새로운 테스트 작성 시 고려사항:

- **Given-When-Then** 구조 사용
- **안정적인 선택자** 사용 (CSS 클래스 지양)
- **적절한 대기 시간** 설정 (`waitForSelector`, `toBeVisible`)
- **테스트 격리** 보장 (각 테스트가 독립적으로 실행)
- **명확한 검증 로직** 작성

### 🔄 **CI/CD 통합**

지속적 통합을 위한 명령어:

```bash
# 헤드리스 모드로 실행 (CI 환경)
npx playwright test --headed=false

# 재시도 포함 (불안정한 네트워크 환경 대응)
npx playwright test --retries=2

# 병렬 실행 제한 (리소스 제약 환경)
npx playwright test --workers=2
```

# WebSocket 설정 가이드

문제 상황 Kubernetes 환경에서 Socket.IO WebSocket 연결 시 HTTP 400 Bad Request
에러 발생 해결책 nginx Ingress Controller의 올바른 annotation 사용:

```yaml
# ❌ 잘못된 설정 (Community Controller 용)
nginx.ingress.kubernetes.io/websocket-services: 'service-name'

# ✅ 올바른 설정 (NGINX Inc. Controller 용)
nginx.org/websocket-services: 'service-name'
```

## 전체 Ingress 설정

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx

    # CORS 설정
    nginx.ingress.kubernetes.io/enable-cors: 'true'
    nginx.ingress.kubernetes.io/cors-allow-origin: '*'
    nginx.ingress.kubernetes.io/cors-allow-methods:
      'GET, POST, PUT, DELETE, OPTIONS'
    nginx.ingress.kubernetes.io/cors-allow-headers: 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization'

    # WebSocket 기본 설정
    nginx.ingress.kubernetes.io/enable-websocket: 'true'
    nginx.ingress.kubernetes.io/proxy-http-version: '1.1'
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
    nginx.ingress.kubernetes.io/use-regex: 'true'
    nginx.ingress.kubernetes.io/upstream-hash-by: '$arg_sessionId'

    # 핵심: NGINX Inc. Controller용 WebSocket 설정
    nginx.org/websocket-services: 'your-service-name'
spec:
  ingressClassName: nginx
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /
            pathType: ImplementationSpecific
            backend:
              service:
                name: your-service-name
                port:
                  number: 8080
```

## 주의사항

두 annotation을 동시에 사용하지 말 것 사용 중인 Controller에 맞는 annotation만
적용 변경 후 Ingress Controller 재시작 불필요 (자동 적용)
