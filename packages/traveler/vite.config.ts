import { defineConfig } from 'vite';
import { extname, relative, resolve } from 'path';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';


// glob 결과를 콘솔에 출력
const libFiles = glob.sync('lib/**/*.{ts,tsx}', {
  ignore: ['lib/**/*.d.ts'],
});
console.info('Found files:', libFiles);

// 변환된 entry points 객체도 확인
const entryPoints = Object.fromEntries(
  libFiles.map((file) => [
    relative('lib', file.slice(0, file.length - extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);
console.info('Entry points:', entryPoints);

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8888,
    host: '0.0.0.0',
  },

  plugins: [
    react({ jsxImportSource: '@emotion/react' }),
    libInjectCss(),
    tailwindcss(),
    dts({
      include: ['lib'],
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        '@emotion/react',
        '@emotion/styled',
        '@babylonjs/core',
        '@babylonjs/loaders',
        '@babylonjs/gui',
        '@babylonjs/inspector',
        '@babylonjs/materials',
        '@babylonjs/post-processes',
        '@babylonjs/procedural-textures',
        '@babylonjs/serializers',
      ],
      input: entryPoints,
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name].css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
    },
  },
});
