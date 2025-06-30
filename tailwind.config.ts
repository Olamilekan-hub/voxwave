import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // VoxWave Brand Colors - Green & Black Theme
        brand: {
          primary: '#00FF88', // Bright green
          secondary: '#00CC6A', // Medium green
          tertiary: '#009951', // Dark green
          accent: '#00FFB3', // Light green accent
        },
        // Green palette
        green: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Main green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Enhanced black/gray palette
        dark: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Background colors
        background: {
          primary: '#000000', // Pure black
          secondary: '#0F172A', // Very dark blue-gray
          tertiary: '#1E293B', // Dark blue-gray
          accent: '#00FF88', // Brand green
        },
        // Text colors
        text: {
          primary: '#FFFFFF', // White text
          secondary: '#F1F5F9', // Light gray
          tertiary: '#CBD5E1', // Medium gray
          accent: '#00FF88', // Brand green
          muted: '#64748B', // Muted gray
        },
        // Border colors
        border: {
          primary: '#334155',
          secondary: '#475569',
          accent: '#00FF88',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGreen: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' 
          },
          '70%': { 
            boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' 
          },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00FF88, 0 0 10px #00FF88, 0 0 15px #00FF88' 
          },
          '100%': { 
            boxShadow: '0 0 10px #00FF88, 0 0 20px #00FF88, 0 0 30px #00FF88' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-green': 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #0F172A 100%)',
      },
      boxShadow: {
        'green': '0 4px 14px 0 rgba(0, 255, 136, 0.25)',
        'green-lg': '0 10px 25px -3px rgba(0, 255, 136, 0.35)',
        'dark': '0 4px 14px 0 rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}

export default config