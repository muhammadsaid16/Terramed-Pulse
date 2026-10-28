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
        arabic: ['Cairo', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      colors: {
        obsidian: {
          950: '#030407',
          900: '#08090D',
          850: '#0D0E15',
          800: '#12141E',
          700: '#1A1D2B',
          600: '#262A3E'
        },
        apple: {
          blue: '#0A84FF',
          mint: '#30D158',
          orange: '#FF9F0A',
          red: '#FF453A',
          purple: '#BF5AF2',
          cyan: '#64D2FF',
          indigo: '#5E5CE6',
          pink: '#FF375F',
          yellow: '#FFD60A'
        },
        space: {
          950: '#05070D',
          900: '#0A0E17',
          850: '#0E1320',
          800: '#141A2B',
          700: '#1D253D',
          600: '#2A3452'
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
      borderRadius: {
        '4xl': '2rem',
        'apple': '1.375rem',
      },
      boxShadow: {
        'apple-subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'apple-glass': '0 20px 45px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'apple-card': '0 12px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'apple-glow': '0 0 35px -5px rgba(10, 132, 255, 0.35)',
        'apple-glow-teal': '0 0 30px -5px rgba(45, 212, 191, 0.35)',
        'apple-button': '0 4px 14px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
      }
    },
  },
  plugins: [],
}
