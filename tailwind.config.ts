import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-cal)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c0d1ff',
          400: '#7b9fff',
          500: '#5578f6',
          600: '#3d5ce8',
          700: '#2f4ad4',
          800: '#2840b5',
          900: '#1e2f8a',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fc',
          100: '#f0f2f8',
          200: '#e4e7f0',
          300: '#d0d5e8',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'card-lg': '0 8px 24px 0 rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        'inner':   'inset 0 1px 2px 0 rgb(0 0 0 / 0.06)',
        'glow':    '0 0 0 3px rgb(85 120 246 / 0.25)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-in':   'slideIn 0.3s ease-out forwards',
        'shimmer':    'shimmer 1.6s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
export default config
