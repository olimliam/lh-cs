# 네이밍 컨벤션 실무 가이드

## 📋 개요

이 프로젝트는 파일명은 `kebab-case`, 함수명은 `camelCase`, 컴포넌트명은 `PascalCase`를 사용합니다.

> � **상세한 설계 배경과 이론**: [프론트엔드 네이밍 컨벤션 설계](./frontend-naming-convention.md)를 참조하세요.

## ⚡ 빠른 체크리스트

### ✅ 파일명 규칙 (kebab-case)

```
✅ user-profile.tsx
✅ use-user-data.ts
✅ api-client.service.ts
✅ user-management.utils.ts
✅ whiteboard.types.ts
✅ auth.constants.ts
```

```
❌ UserProfile.tsx
❌ useUserData.ts
❌ apiClient.service.ts
❌ UserManagement.utils.ts
❌ WhiteBoard.types.ts
❌ Auth.constants.ts
```

### ✅ 함수명 규칙

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

### ✅ 폴더명 규칙 (kebab-case)

```
✅ src/features/user-management/
✅ src/shared/ui/icons/
✅ src/features/drawer/utils/
```

```
❌ src/features/UserManagement/
❌ src/shared/ui/Icons/
❌ src/features/drawer/Utils/
```
## 🔧 ESLint 자동 검증

현재 네이밍 컨벤션은 ESLint로 자동 검증됩니다:

```bash
# 네이밍 규칙 확인
pnpm lint

# 자동 수정 가능한 부분 수정
pnpm lint:fix

# 네이밍 컨벤션만 체크
pnpm lint:naming
```

## 📁 FSD 아키텍처 적용 예시

```
src/
├── features/
│   ├── user-management/           # kebab-case
│   │   ├── api/
│   │   │   ├── get-users.api.ts  # kebab-case + 용도 표시
│   │   │   └── create-user.api.ts
│   │   ├── model/
│   │   │   ├── use-user-list.ts  # kebab-case
│   │   │   └── use-user-form.ts
│   │   └── ui/
│   │       ├── user-list.tsx     # kebab-case
│   │       └── user-form.tsx
│   └── drawer/
│       ├── hooks/
│       │   └── use-canvas-drawing.ts
│       ├── ui/
│       │   ├── drawing-tool-box.tsx
│       │   └── color-chip-btns.tsx
│       └── utils/
│           └── image-share.utils.ts
├── shared/
│   ├── ui/
│   │   ├── circle-button.tsx
│   │   └── spinner.tsx
│   └── utils/
│       ├── audio-play.ts
│       └── move-scene.ts
```

```typescript
// 파일 내부에서는 함수명과 컴포넌트명 규칙 적용
export const getUserList = () => { ... }      // camelCase
export const useUserList = () => { ... }      // camelCase
export const UserList = () => { ... }         // PascalCase
export const DrawingToolBox = () => { ... }   // PascalCase
```

## 📝 마이그레이션 가이드

### 현재 상태
- 네이밍 규칙은 `warn` 모드로 설정 (경고만 표시)
- 점진적으로 기존 파일들을 kebab-case로 변경 예정
- 새로 생성하는 파일은 반드시 kebab-case 사용

### 파일 이름 변경 방법

```bash
# Git을 사용한 안전한 파일명 변경
git mv src/components/UserProfile.tsx src/components/user-profile.tsx

# Import 경로도 함께 수정 필요
# Before: import { UserProfile } from './UserProfile';
# After:  import { UserProfile } from './user-profile';
```

## 🎯 VS Code 통합

### 실시간 검증
- 파일 생성 시 즉시 규칙 위반 감지
- 빨간 밑줄로 경고 표시  
- 저장 시 자동 ESLint 수정

### 권장 확장 프로그램
프로젝트를 열면 자동으로 설치 알림 표시:
- ESLint
- Prettier  
- TypeScript
- Tailwind CSS

## 💡 개발 팁

1. **새 파일 생성**: 항상 kebab-case 사용
2. **기존 파일 수정**: 가능하면 kebab-case로 변경
3. **폴더 생성**: kebab-case 사용
4. **컴포넌트 함수명**: PascalCase 유지
5. **일반 함수명**: camelCase 유지

## 📊 현재 프로젝트 상태 확인

```bash
# 네이밍 규칙 위반 파일 확인
pnpm lint | grep "filename-naming-convention"

# 전체 린트 상태 확인
pnpm lint
```

---

**💬 문의사항이 있다면 팀 리더에게 연락하거나 [상세 설계 문서](./frontend-naming-convention.md)를 참조하세요.**

- VS Code에서 파일 생성 시 즉시 네이밍 규칙 검증
- 빨간 밑줄로 규칙 위반 표시
- 저장 시 자동 포맷팅 적용

### 명령어

```bash
# 린트 검사 실행
npm run lint

# 린트 오류 자동 수정 (가능한 경우)
npm run lint -- --fix
```

## 📂 FSD 아키텍처 적용

Feature-Sliced Design에 맞는 네이밍 구조:

```
src/
├── app/                    # 앱 레벨 설정
│   ├── providers/
│   └── router/
├── pages/                  # 페이지 컴포넌트
│   ├── home-page.tsx
│   └── user-page.tsx
├── widgets/                # 독립적인 UI 블록
│   ├── header.tsx
│   └── sidebar.tsx
├── features/               # 비즈니스 기능
│   ├── user-auth/
│   ├── product-catalog/
│   └── shopping-cart/
├── entities/               # 비즈니스 엔티티
│   ├── user/
│   ├── product/
│   └── order/
└── shared/                 # 공통 코드
    ├── ui/
    ├── lib/
    └── api/
```

## 🎯 네이밍 체크리스트

### 파일 생성 전 확인사항

- [ ] 파일명이 `kebab-case`인가?
- [ ] 폴더명이 `kebab-case`인가?
- [ ] 용도가 명확한 파일명인가?
- [ ] 확장자 앞에 용도를 명시했는가? (`.api.ts`, `.types.ts` 등)

### 코드 작성 시 확인사항

- [ ] 함수명이 `camelCase`인가?
- [ ] 컴포넌트명이 `PascalCase`인가?
- [ ] Hook이 `use`로 시작하는가?
- [ ] 상수가 `SCREAMING_SNAKE_CASE`인가?
- [ ] 타입/인터페이스가 `PascalCase`인가?

## 🔄 마이그레이션 가이드

기존 파일을 새로운 컨벤션으로 변경할 때:

1. **점진적 적용**: 새로운 파일부터 규칙 적용
2. **일괄 변경**: 프로젝트 안정성을 고려하여 단계적 마이그레이션
3. **Import 경로 업데이트**: 파일명 변경 시 모든 import 구문 수정

### 예시 마이그레이션

```bash
# Before
UserProfile.tsx → user-profile.tsx
getUsersAPI.ts → get-users.api.ts
useUserData.ts → use-user-data.ts
```

## 🚨 일반적인 실수들

### 1. 대소문자 혼용

```typescript
// ❌ 잘못된 예
const getUserAPI = () => { ... }
const UserProfilePage = 'user-profile-page.tsx'

// ✅ 올바른 예
const getUserApi = () => { ... }
// 파일명: user-profile-page.tsx
```

### 2. 일관성 없는 명명

```typescript
// ❌ 잘못된 예 (일관성 없음)
const getUser = () => { ... }
const fetchUserData = () => { ... }
const retrieveUserInfo = () => { ... }

// ✅ 올바른 예 (일관성 있음)
const getUser = () => { ... }
const getUserData = () => { ... }
const getUserInfo = () => { ... }
```

### 3. 약어 남용

```typescript
// ❌ 잘못된 예
const usrMgmt = () => { ... }
const getUsrProf = () => { ... }

// ✅ 올바른 예
const userManagement = () => { ... }
const getUserProfile = () => { ... }
```

## 📚 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [JavaScript Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript#naming_conventions)
- [ESLint Check File Plugin](https://www.npmjs.com/package/eslint-plugin-check-file)

---

> 💡 **팁**: 네이밍 컨벤션은 코드의 가독성과 유지보수성을 높이는 중요한
> 요소입니다. 일관된 규칙을 따르면 팀 전체의 생산성이 향상됩니다.
