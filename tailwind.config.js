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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'],
      },
      colors: {
        space: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0C1527',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155'
        },
        nasa: {
          blue: '#0F2C59',
          light: '#2563EB',
          dark: '#081833'
        },
        teal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        }
      },
      boxShadow: {
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'apple-glow': '0 0 25px -5px rgba(13, 148, 136, 0.4)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
