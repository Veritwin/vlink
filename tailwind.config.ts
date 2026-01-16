import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VeriTwin Brand Palette - Based on logo blue #004E92
        primary: {
          50: '#e6f0f7',
          100: '#cce0ef',
          200: '#99c2df',
          300: '#66a3cf',
          400: '#3385bf',
          500: '#004E92', // Logo blue - primary brand color
          600: '#004482',
          700: '#003a71',
          800: '#002f5c',
          900: '#001f3d'
        },
        accent: {
          50: '#e6f4fa',
          100: '#b3def2',
          200: '#80c8ea',
          300: '#4db2e2',
          400: '#1a9cda',
          500: '#0F9ED5', // Cyan accent
          600: '#0d8abf',
          700: '#0a6f99',
          800: '#085573',
          900: '#053a4d'
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#196B24', // Green from brand
          600: '#388e3c',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#103b13'
        },
        neutral: {
          50: '#F8FAFB',
          100: '#F1F5F9',
          200: '#E8E8E8', // Light gray from brand
          300: '#D1D6DC',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        danger: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#C62828',
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#8e0000'
        },
        // VLink specific colors
        vlink: {
          primary: '#004E92',
          secondary: '#0F9ED5',
          gradient: {
            start: '#001f3d',
            mid: '#004E92',
            end: '#0F9ED5'
          }
        },
        // Additional brand colors
        brand: {
          navy: '#004E92', // Logo blue
          teal: '#0066b3', // Lighter shade for hover
          cyan: '#0F9ED5',
          light: '#E8E8E8',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      fontSize: {
        'display-1': ['clamp(2.125rem, 1.875rem + 1.25vw, 3rem)', { lineHeight: '1.15' }],
        'display-2': ['clamp(2.5rem, 2rem + 2.5vw, 4rem)', { lineHeight: '1.1' }],
        'h1': ['clamp(1.875rem, 1.625rem + 1.25vw, 2.5rem)', { lineHeight: '1.2' }],
        'h2': ['clamp(1.5rem, 1.375rem + 0.625vw, 2rem)', { lineHeight: '1.25' }],
        'h3': ['clamp(1.25rem, 1.125rem + 0.5vw, 1.5rem)', { lineHeight: '1.3' }],
        'body-lg': ['clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)', { lineHeight: '1.6' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scroll': 'scroll 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(15, 158, 213, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(15, 158, 213, 0.6)' }
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(15, 158, 213, 0.3)',
        'glow-lg': '0 0 40px rgba(15, 158, 213, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 78, 146, 0.1), 0 2px 4px -1px rgba(0, 78, 146, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #001f3d 0%, #004E92 50%, #0F9ED5 100%)',
        'vlink-gradient': 'linear-gradient(135deg, #001f3d 0%, #004E92 40%, #0F9ED5 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(15, 158, 213, 0.05) 0%, rgba(0, 78, 146, 0.05) 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};

export default config;
