/** @type {import('tailwindcss').Config} */

export default {
  // mode: 'jit',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../../packages/components/**/*.{js,ts,jsx,tsx}',
  ],
  important: true,
  plugins: [],
};
