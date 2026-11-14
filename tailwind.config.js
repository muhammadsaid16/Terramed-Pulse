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
        display: ['"Space Grotesk"', 'Archivo', 'Cairo', '-apple-system', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Telemetry micro-steps: labels/readouts below body size.
        // Floor is 11px for tracking labels and 12px for running micro-copy —
        // anything smaller stops being readable on a laptop or a projector.
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],     // 11px
        'micro': ['0.75rem', { lineHeight: '1.0625rem' }], // 12px
      },
      colors: {
        teal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        },
        ink: {
          950: '#04070D',
          900: '#070C15',
          850: '#0A111C',
          800: '#0D1624'
        }
      },
      boxShadow: {
        console: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -32px rgba(0,0,0,0.75)',
        instrument: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 10px 30px -18px rgba(0,0,0,0.6)'
      }
    },
  },
  plugins: [],
}
