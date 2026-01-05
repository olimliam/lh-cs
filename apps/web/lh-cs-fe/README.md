# LH CS FE

## 📋 네이밍 컨벤션

이 프로젝트는 일관된 코딩 스타일을 위해 다음 네이밍 컨벤션을 사용합니다:

- **파일명**: `kebab-case` (예: `user-profile.tsx`, `use-user-data.ts`)
- **함수명**: `camelCase` (예: `getUserData`, `useUserData`)
- **컴포넌트명**: `PascalCase` (예: `UserProfile`, `DrawingToolBox`)
- **폴더명**: `kebab-case` (예: `user-management`, `drawing-tools`)

📖 자세한 가이드는 [docs/naming-convention.md](./docs/naming-convention.md)를
참조하세요.

### Known Issues and Patches

#### dom-helpers Import Issue

**문제**: `dom-helpers@5.2.1` 패키지의 ES 모듈 호환성 문제로 빌드 실패

```
"default" is not exported by "hasClass.d.ts", imported by "addClass.js"
```

**해결책**: `postinstall` 스크립트에서 자동 패치 적용 (크로스 플랫폼 지원)

```json
{
  "scripts": {
    "postinstall": "patch-package && node -e \"const fs = require('fs'); const path = 'node_modules/.pnpm/dom-helpers@5.2.1/node_modules/dom-helpers/esm/addClass.js'; if (fs.existsSync(path)) { const content = fs.readFileSync(path, 'utf8'); fs.writeFileSync(path, content.replace('import hasClass from', 'import * as hasClass from')); }\""
  }
}
```

**장점**: macOS, Linux, Windows 모든 환경과 GitHub Actions에서 동작

**수정 내용**: `import hasClass from './hasClass';` →
`import * as hasClass from './hasClass';`

**적용 파일**:
`node_modules/.pnpm/dom-helpers@5.2.1/node_modules/dom-helpers/esm/addClass.js`

# 배포 히스토리

- [Dev]
  - v1.0.21
    - iframe 테스트
  ## v1.2.18

# CI/CD Trouble shooting

- DOCKER LOGIN
