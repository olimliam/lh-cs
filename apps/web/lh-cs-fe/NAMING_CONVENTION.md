# 네이밍 컨벤션 체크리스트

이 프로젝트는 파일명은 `kebab-case`, 함수명은 `camelCase`, 컴포넌트명은
`PascalCase`를 사용합니다.

## ✅ 파일명 규칙

### 올바른 예시

```
✅ user-profile.tsx
✅ use-user-data.ts
✅ api-client.service.ts
✅ user-management.utils.ts
✅ whiteboard.types.ts
✅ auth.constants.ts
```

### 잘못된 예시

```
❌ UserProfile.tsx
❌ useUserData.ts
❌ apiClient.service.ts
❌ UserManagement.utils.ts
❌ WhiteBoard.types.ts
❌ Auth.constants.ts
```

## ✅ 함수명 규칙

### 올바른 예시

```typescript
// 일반 함수 - camelCase
const getUserData = () => {...}
const handleSubmit = () => {...}
const validateEmail = () => {...}

// Hook - camelCase
const useUserData = () => {...}
const useLocalStorage = () => {...}

// React 컴포넌트 - PascalCase
const UserProfile = () => {...}
const DrawingToolBox = () => {...}
```

## 📁 폴더명 규칙

### 올바른 예시

```
✅ src/features/user-management/
✅ src/shared/ui/icons/
✅ src/features/drawer/utils/
```

### 잘못된 예시

```
❌ src/features/UserManagement/
❌ src/shared/ui/Icons/
❌ src/features/drawer/Utils/
```

## 🔧 ESLint 설정

현재 네이밍 컨벤션은 ESLint로 자동 검증됩니다:

```bash
# 네이밍 규칙 확인
pnpm lint

# 자동 수정 가능한 부분 수정
pnpm lint --fix
```

## 📝 마이그레이션 가이드

### 1. 단계별 접근

- 현재는 `warn` 모드로 설정 (경고만 표시)
- 점진적으로 기존 파일들을 kebab-case로 변경
- 새로 생성하는 파일은 반드시 kebab-case 사용

### 2. 파일 이름 변경 방법

```bash
# Git을 사용한 안전한 파일명 변경
git mv src/components/UserProfile.tsx src/components/user-profile.tsx

# 여러 파일 한번에 변경 (주의: import 경로도 수정 필요)
find src -name "*.tsx" -exec rename 's/([A-Z])/sprintf("-%s", lc($1))/ge' {} \;
```

### 3. Import 경로 수정

파일명을 변경한 후에는 해당 파일을 import하는 모든 곳의 경로를 수정해야 합니다:

```typescript
// Before
import { UserProfile } from './UserProfile';

// After
import { UserProfile } from './user-profile';
```

## 🎯 VS Code 통합

### 실시간 검증

- 파일 생성 시 즉시 규칙 위반 감지
- 빨간 밑줄로 경고 표시
- 저장 시 자동 ESLint 수정

### 권장 확장 프로그램

프로젝트를 열면 자동으로 권장 확장 프로그램 설치 알림이 표시됩니다:

- ESLint
- Prettier
- TypeScript
- Tailwind CSS

## 📊 현재 상태

다음 명령어로 현재 네이밍 규칙 위반 사항을 확인할 수 있습니다:

```bash
cd apps/web/lh-cs-fe
pnpm lint | grep "filename-naming-convention"
```

## 💡 팁

1. **새 파일 생성 시**: 항상 kebab-case 사용
2. **기존 파일 수정 시**: 가능하면 kebab-case로 변경
3. **폴더 생성 시**: kebab-case 사용
4. **컴포넌트 함수명**: PascalCase 유지
5. **일반 함수명**: camelCase 유지

## 🚀 자동화 도구

팀의 생산성을 위해 다음 자동화가 설정되어 있습니다:

- ✅ ESLint 실시간 검증
- ✅ VS Code 저장 시 자동 수정
- ✅ Git pre-commit 훅 (선택사항)
- ✅ CI/CD 파이프라인 검증

---

**궁금한 점이 있다면 팀 리더에게 문의하거나
[네이밍 컨벤션 가이드](./docs/frontend-naming-convention.md)를 참조하세요.**
