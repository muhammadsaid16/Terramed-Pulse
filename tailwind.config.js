/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'Cairo', '-apple-system', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Telemetry micro-steps: labels/readouts below body size.
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
        'micro': ['0.6875rem', { lineHeight: '1rem' }],    // 11px
      },
      colors: {
        teal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        }
      }
    },
  },
  plugins: [],
}
