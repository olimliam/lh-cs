# 프론트엔드 파일 네이밍 컨벤션: 일관성이 생산성을 만든다

코드를 작성하는 것보다 어려운 일이 있다면, 그것은 바로 **이름을 짓는 것**이다.
특히 파일명과 함수명의 네이밍 컨벤션은 프로젝트의 규모가 커질수록 더욱
중요해진다. 오늘은 왜 파일명은 `kebab-case`를 사용하고 함수명은 `camelCase`를
사용하는지, 그리고 이런 컨벤션이 실제 개발에 어떤 영향을 미치는지 살펴보려 한다.

## 파일명과 함수명, 왜 다르게 명명할까?

프로젝트를 살펴보면 다음과 같은 패턴을 볼 수 있다:

```
📁 use-test-options.ts (kebab-case)
🔧 useTestOptions() (camelCase)

📁 get-options.api.ts (kebab-case)
🔧 getTestOptions() (camelCase)

📁 option-list.tsx (kebab-case)
🔧 OptionList() (PascalCase)
```

이런 차이가 생긴 이유는 **파일 시스템의 현실** 때문이다.

## 파일 시스템의 숨겨진 함정

### 대소문자 구분의 문제

Windows와 macOS는 기본적으로 대소문자를 구분하지 않는다. 이는 다음과 같은 상황을
만들어낸다

```bash
# 개발자 A가 생성한 파일
useTestOptions.ts

# 개발자 B가 생성한 파일 (다른 파일이라고 생각함)
UseTestOptions.ts

# 하지만 Windows/macOS에서는 같은 파일로 인식됨!
```

Linux에서는 두 파일이 다르게 인식되지만, Windows나 macOS에서는 같은 파일로
취급된다. 이런 불일치는 배포 환경에서 예상치 못한 오류를 발생시킨다.

### Git의 대소문자 문제

Git도 이런 문제에서 자유롭지 않다:

```bash
# 파일명을 변경했지만 Git이 인식하지 못하는 경우
git mv useTestOptions.ts UseTestOptions.ts
# 때로는 제대로 추적되지 않는다

# kebab-case는 이런 문제가 없다
git mv use-test-options.ts user-test-options.ts
# 항상 명확하게 추적된다
```

## kebab-case의 숨은 장점들

### URL 친화적

웹 개발에서 파일 경로는 종종 URL과 직결된다:

```
# 읽기 쉬운 URL
/features/option-list/use-test-options

# 읽기 어려운 URL
/features/optionList/useTestOptions
```

`kebab-case`는 URL에서 단어 구분이 명확해 가독성이 좋다.

### 명령어 입력의 편의성

터미널에서 파일을 다룰 때도 차이가 난다:

```bash
# 간단명료
vim use-test-options.ts
ls option-*

# 대소문자 신경쓰며 입력해야 함
vim useTestOptions.ts
ls option*  # 찾기 어려움
```

## 함수명은 왜 camelCase일까?

그렇다면 함수명은 왜 `camelCase`를 사용할까? 이는 **언어의 관습** 때문이다.

### JavaScript의 전통

JavaScript는 태생부터 `camelCase`를 사용해왔다:

```javascript
// JavaScript 내장 메서드들
Array.prototype.forEach;
String.prototype.toLowerCase;
Document.getElementById;

// React Hook 패턴
useState, useEffect, useCallback;
```

### 코드 가독성

함수명에서 `camelCase`는 가독성을 높인다:

```typescript
// 자연스러운 읽기
const userData = useUserData();
const isLoading = getLoadingState();

// 어색한 읽기
const user_data = use_user_data();
const is_loading = get_loading_state();
```

## FSD 아키텍처에서의 실제 적용

Feature-Sliced Design에서는 이런 컨벤션이 더욱 중요하다:

```
features/
├── user-management/           # kebab-case
│   ├── api/
│   │   ├── get-users.api.ts  # kebab-case
│   │   └── create-user.api.ts
│   ├── model/
│   │   ├── use-user-list.ts  # kebab-case
│   │   └── use-user-form.ts
│   └── ui/
│       ├── user-list.tsx     # kebab-case
│       └── user-form.tsx
```

```typescript
// 파일 내부에서는 camelCase/PascalCase
export const getUserList = () => { ... }      // camelCase
export const useUserList = () => { ... }      // camelCase
export const UserList = () => { ... }         // PascalCase
export const UserForm = () => { ... }         // PascalCase
```

## 다른 네이밍 스타일과의 비교

### snake_case (Python 스타일)

```
use_test_options.ts
get_options_api.ts
```

Python 개발자들에게는 친숙하지만, JavaScript 생태계에서는 어색하다.

### PascalCase (C# 스타일)

```
UseTestOptions.ts
GetOptionsApi.ts
```

파일명으로 사용하기에는 앞서 언급한 대소문자 문제가 있다.

### camelCase 파일명

```
useTestOptions.ts
getOptionsApi.ts
```

일부 팀에서 사용하지만, 파일 시스템 호환성 문제가 있다.

## 팀에서의 컨벤션 통일

### ESLint로 네이밍 컨벤션 자동화하기

일관된 네이밍 컨벤션을 위해서는 수동 검토보다는 **자동화된 도구**를 사용하는
것이 효과적이다. ESLint의 `eslint-plugin-check-file` 플러그인을 사용하면
파일명과 폴더명 규칙을 자동으로 검증할 수 있다.

#### 1. 필요한 패키지 설치

```bash
pnpm add -D eslint-plugin-check-file
```

#### 2. ESLint 설정 추가

```javascript
// eslint.config.js
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  // ... 기타 설정
  {
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      // 파일 네이밍 컨벤션 규칙
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          // 예외 파일들
          ignoreMiddleExtensions: true,
          ignore: [
            'src/App.tsx', // 메인 App 컴포넌트
            'src/main.tsx', // 엔트리 포인트
            'vite.config.ts',
            'vitest.config.ts',
          ],
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
        },
      ],
    },
  }
);
```

#### 3. VS Code 통합 설정

실시간으로 네이밍 규칙을 확인하기 위해 VS Code 설정을 추가한다:

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

#### 4. 사용법과 결과

이제 `pnpm lint` 명령어로 네이밍 컨벤션을 검증할 수 있다:

```bash
pnpm lint

# 결과 예시
src/App.tsx
  1:1  error  Filename 'App.tsx' does not match the naming convention  check-file/filename-naming-convention

src/pages/HomePage.tsx
  1:1  error  Filename 'HomePage.tsx' does not match the naming convention  check-file/filename-naming-convention

src/widgets/OptionList.tsx
  1:1  error  Filename 'OptionList.tsx' does not match the naming convention  check-file/filename-naming-convention
```

VS Code에서는 파일 생성 시점부터 빨간 밑줄로 규칙 위반을 표시해주어 즉시 수정할
수 있다.

#### 5. 점진적 마이그레이션 전략

기존 프로젝트에서는 한 번에 모든 파일을 바꾸기 어려우므로 점진적 접근을
권장한다:

```javascript
// 단계별 적용
'check-file/filename-naming-convention': [
  'warn', // 먼저 경고로 시작
  {
    '**/*.{ts,tsx}': 'KEBAB_CASE',
  },
  {
    ignore: [
      // 기존 파일들을 임시로 예외 처리
      'src/components/UserList.tsx',
      'src/hooks/useUserData.ts',
      // ... 점진적으로 줄여나감
    ],
  },
],
```

### 프로젝트 템플릿 활용

```bash
# CLI 도구로 일관된 파일 생성
npx create-feature user-management
# 자동으로 kebab-case 파일들이 생성됨
```

## 실무에서의 경험담

### 마이그레이션의 어려움

기존 프로젝트에서 네이밍 컨벤션을 바꾸는 것은 쉽지 않다. 특히 import 경로가 모두
바뀌어야 하기 때문이다:

```typescript
// Before
import { useTestOptions } from './useTestOptions';

// After
import { useTestOptions } from './use-test-options';
```

하지만 ESLint 자동화를 도입하면서 다음과 같은 이점을 경험했다:

### ESLint 자동화의 실제 효과

#### 1. 즉시 피드백

```bash
# 파일 생성 즉시 규칙 위반 감지
touch src/components/UserProfile.tsx
# VS Code에서 즉시 빨간 밑줄과 함께 경고 표시
```

#### 2. CI/CD 통합

```yaml
# GitHub Actions 예시
- name: Lint check
  run: pnpm lint
  # 네이밍 규칙 위반 시 빌드 실패
```

#### 3. 코드 리뷰 효율성

네이밍 컨벤션 관련 리뷰 코멘트가 90% 감소했다. 개발자들은 더 중요한 로직과
아키텍처에 집중할 수 있게 되었다.

### 새 팀원의 적응

명확한 네이밍 컨벤션과 ESLint 자동화가 있으면 새로운 팀원이 프로젝트에 적응하기
쉽다:

```bash
# 새 팀원이 실수로 잘못된 네이밍을 사용해도
touch src/components/UserList.tsx

# 즉시 자동으로 알려준다
src/components/UserList.tsx
  1:1  error  Filename 'UserList.tsx' does not match the naming convention

# 올바른 방법을 학습하게 된다
mv src/components/UserList.tsx src/components/user-list.tsx
```

파일을 찾는 시간이 줄어들고, 어디에 무엇을 만들어야 할지 직관적으로 알 수 있다.
특히 ESLint가 실시간으로 가이드를 제공하므로 학습 곡선이 크게 단축된다.

## 네이밍 컨벤션 체크리스트

### 파일명 규칙

- ✅ `kebab-case` 사용
- ✅ 소문자만 사용
- ✅ 의미 있는 단어 조합
- ✅ 확장자 앞에 용도 명시 (`.api.ts`, `.types.ts`, `.utils.ts`)

### 함수명 규칙

- ✅ `camelCase` 사용 (일반 함수)
- ✅ `PascalCase` 사용 (React 컴포넌트)
- ✅ 동사로 시작 (함수)
- ✅ 명사로 시작 (컴포넌트)

### 디렉토리 규칙

- ✅ `kebab-case` 사용
- ✅ 단수형 사용 (`user` not `users`)
- ✅ 기능 중심 네이밍 (`user-management`, `option-list`)

## 결론

파일 네이밍 컨벤션은 사소해 보이지만 개발 생산성에 큰 영향을 미친다.
`kebab-case` 파일명과 `camelCase` 함수명의 조합은 다음과 같은 이유로 최적의
선택이다:

- **크로스 플랫폼 호환성**: Windows, macOS, Linux 모두에서 안전
- **Git 안정성**: 버전 관리에서 예상치 못한 문제 방지
- **URL 친화성**: 웹 환경에서 자연스러운 경로 구조
- **언어 일관성**: JavaScript/TypeScript 생태계 표준 준수

그리고 이런 컨벤션을 **ESLint로 자동화**하면:

- **즉시 피드백**: 파일 생성 시점부터 규칙 검증
- **팀 일관성**: 모든 개발자가 동일한 규칙을 자동으로 따름
- **코드 리뷰 효율성**: 네이밍 관련 리뷰 시간 단축
- **신규 개발자 온보딩**: 학습 곡선 단축과 빠른 적응

좋은 컨벤션은 개발자의 인지 부하를 줄이고, 팀의 생산성을 높인다. 파일을 찾기
위해 헤매는 시간, 대소문자 때문에 발생하는 버그, 일관성 없는 명명으로 인한 혼란.
이 모든 것들을 방지하는 것이 바로 올바른 네이밍 컨벤션과 자동화 도구의 힘이다.

---

> _"There are only two hard things in Computer Science: cache invalidation and
> naming things."_ - Phil Karlton

이 유명한 격언처럼, 좋은 이름을 짓는 것은 어렵다. 하지만 일관된 규칙을 정하고 팀
전체가 따르면, 그 어려움을 크게 줄일 수 있다. 오늘부터라도 프로젝트의 네이밍
컨벤션을 점검해보는 것은 어떨까.

## 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [JavaScript Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript#naming_conventions)
- [Git Case Sensitivity](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreignoreCase)
- [eslint-plugin-check-file](https://www.npmjs.com/package/eslint-plugin-check-file) -
  파일/폴더 네이밍 컨벤션 자동화
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/configuration-files) -
  ESLint 설정 가이드
