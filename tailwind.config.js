/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFBF3',
        cream: '#F6EFDF',
        navy: { DEFAULT: '#1B2A41', soft: '#3A4A63', faint: '#6B778A' },
        sage: { light: '#E3EEE5', DEFAULT: '#6B9A76', dark: '#3F6B4A' },
        mustard: { light: '#FBF1D3', DEFAULT: '#E9C46A', dark: '#8A6A12' },
        brick: { light: '#F8E2DC', DEFAULT: '#C0533A', dark: '#8E3523' },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
