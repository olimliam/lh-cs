import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import checkFile from 'eslint-plugin-check-file';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'check-file': checkFile,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 파일 네이밍 컨벤션 규칙 (점진적 마이그레이션을 위해 warn으로 시작)
      'check-file/filename-naming-convention': [
        'warn', // 처음에는 경고로 시작하여 점진적으로 error로 변경
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          // 예외 파일들
          ignoreMiddleExtensions: true,
          ignore: [
            'src/app.tsx', // 메인 App 컴포넌트
            'src/main.tsx', // 엔트리 포인트
            'vite.config.ts',
            'vitest.config.ts',
            'tailwind.config.js',
            'postcss.config.js',
            'eslint.config.js',
            'eslintrc.js',
            'index.html',
            'README.md',
            // 기존 파일들을 임시로 예외 처리 (점진적으로 마이그레이션)
            'src/**/*.d.ts', // 타입 정의 파일들
          ],
        },
      ],
      'check-file/folder-naming-convention': [
        'warn', // 처음에는 경고로 시작
        {
          'src/**/': 'KEBAB_CASE',
        },
      ],
    },
  }
);
