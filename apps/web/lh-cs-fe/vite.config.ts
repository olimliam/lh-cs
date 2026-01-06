import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/postcss';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8888,
    host: '0.0.0.0',
  },
  plugins: [
    react({
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        icon: true,
      },
      include: '**/*.svg',
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  optimizeDeps: {
    include: [
      '@babylonjs/core',
      '@babylonjs/loaders',
      '@babylonjs/gui',
      '@emotion/react',
      '@emotion/styled',
      'ua-parser-js',
      'swiper',
      'swiper/react',
      'swiper/modules',
      'swiper/css',
      'swiper/css/pagination',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@packages/traveler': resolve(
        __dirname,
        '../../../packages/traveler/lib/main.ts'
      ),
      'ua-parser-js/dist/ua-parser.min': 'ua-parser-js',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.d.ts', '.json'],
  },
  build: {
    commonjsOptions: {
      include: [/ua-parser-js/, /node_modules/],
    },
    rollupOptions: {
      external: (id) => {
        // dom-helpers 관련 문제를 우회
        if (id.includes('dom-helpers')) {
          return false;
        }
        return false;
      },
      // onwarn(warning, warn) {
      //   // dom-helpers 관련 경고 무시
      //   if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('dom-helpers')) {
      //     return;
      //   }
      //   warn(warning);
      // },
      // 필요한 경우 외부 모듈을 최적화 설정
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/loaders', '@babylonjs/gui'],
          emotion: ['@emotion/react', '@emotion/styled'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
