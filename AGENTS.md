# Repository Guidelines

## 프로젝트 구조 및 모듈 구성

- pnpm 워크스페이스 모노레포이며 `apps`, `packages`, `configs`, `docs`,
  `tests`가 핵심 디렉터리입니다.
- `apps/api/lh-cs-be`는 Layered Architecture(presentation → application →
  infrastructure, common 공유)를 따르는 NestJS 서비스입니다.
- CODEX에 기록된 WebSocket 백엔드(`apps/api/es-ws-be`)는 현재 트리에 없으므로
  필요 시 브랜치 동기화를 먼저 확인하세요.
- `apps/web/lh-cs-fe`는 Vite + React 프로젝트로 FSD(app → pages → widgets →
  features → entities → shared)와 `kebab-case` 네이밍을 강제합니다.
- `packages/*`는 `shared`, `traveler` 등 공통 패키지를 포함하며 루트
  `pnpm install` 시 자동 빌드됩니다.

## 빌드 · 테스트 · 개발 명령어

- 루트: `pnpm install`, `pnpm postinstall`, `pnpm lint`, `pnpm format`으로
  워크스페이스를 정돈합니다.
- 백엔드: `pnpm --filter lh-cs-be start:local|dev|prod`, `build`, `test`,
  `test:e2e`, `lint`를 사용합니다.
- 프런트엔드: `pnpm --filter lh-cs-fe dev`, `build:dev`, `build:prd`, `test`,
  `test:coverage`, `lint`, `lint:fix`, `lint:naming`을 활용합니다.
- 종단간 검증은 API(8080)와 FE(8888) 실행 후 `pnpm test:e2e` 또는
  `pnpm test:e2e:report`로 수행합니다.

## 코드 스타일 및 네이밍 규칙

- Prettier(`configs/prettier`)가 2스페이스, single quote, trailing comma,
  Tailwind 정렬을 적용하니 변경 전 `pnpm format`을 실행하세요.
- ESLint(`@configs/eslint-ts`)는 미사용 임포트, 암묵적 any, React 규칙,
  파일·폴더 `kebab-case`를 검사하며 웹앱은
  `pnpm --filter lh-cs-fe lint:naming`으로 강제합니다.
- Nest 계층 import는 하위 → 상위 단방향만 허용하며 DTO·Model·Entity 파일은
  `*.request.ts`, `*.command.ts`, `*.entity.ts` 패턴을 지킵니다.
- 재사용 로직은 `packages/shared` 또는 FSD `shared` 레이어에 두고 TypeScript
  경로 별칭(`@features`, `@entities`, `@shared`)을 사용합니다.

## 테스트 가이드

- 백엔드: `pnpm --filter lh-cs-be test`(단위), `test:cov`(커버리지),
  `test:e2e`(Nest 시나리오). DTO ↔ Model 변환과 CQRS 규칙을 테스트에
  반영하세요.
- 프런트: `pnpm --filter lh-cs-fe test`, `test:coverage`; 테스트 파일은 기능
  슬라이스 인접 경로에 배치합니다.
- Playwright 결과는 `playwright-report/`와 `test-results/`에 저장되며, 실패
  분석용 아티팩트만 커밋합니다.

## 커밋 및 PR 가이드라인

- Conventional Commits(`feat:`, `fix:`, `test:`, `chore:` 등)과 짧은 한국어·영어
  메시지를 사용하고 각 커밋이 빌드 가능하도록 유지합니다.
- 레이어 구조나 패키지 계약을 수정할 때는 관련
  문서(`docs/database-id-naming-convention.md`, `docs/security/`) 업데이트
  여부를 커밋 또는 PR에 기록합니다.
- PR 본문에는 작업 목적, 영향 범위, 수행한 명령(`pnpm test`,
  `pnpm test:e2e:report` 등)과 결과 자료, 롤백 전략을 포함합니다.
- 공유 패키지나 API 계약 수정 시 백엔드·프런트 담당 리뷰어 모두를 지정하고
  호환성 체크리스트를 남깁니다.

## 보안 · 설정 참고

- 비밀 값은 커밋하지 말고 `docs/deployment` 환경 변수 표를 참조해 로컬 `.env`를
  구성합니다.
- 데이터베이스 ID는 문서 규칙(`id`, `{table}_id`, `{purpose}_{table}_id`)을
  따르며 bigint는 TypeScript에서 string으로 다룹니다.
- 인증, Socket.IO, Ingress 설정을 변경하면 `docs/security`와 CODEX 주석을 검토해
  운영 환경과 일치시키세요.
