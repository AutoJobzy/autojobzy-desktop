/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keeping for backward compatibility)
        'neon-blue': '#00f3ff',
        'neon-purple': '#a855f7',
        'neon-green': '#00ff88',
        dark: {
          900: '#0a0e1a',
          800: '#131826',
        },
        // New Modern Theme Colors (Dabang inspired)
        primary: {
          DEFAULT: '#5D5FEF', // Purple
          50: '#F5F5FF',
          100: '#EBEBFF',
          200: '#D6D6FF',
          300: '#B8B9FF',
          400: '#9B9CFF',
          500: '#5D5FEF',
          600: '#4A4CDB',
          700: '#3839B8',
          800: '#2A2B94',
          900: '#1E1F70',
        },
        accent: {
          pink: '#FFE5F1',
          yellow: '#FFF6E5',
          green: '#E5FFF0',
          purple: '#F3E5FF',
          blue: '#E5F2FF',
        },
        card: {
          pink: '#FF6B9D',
          yellow: '#FFB547',
          green: '#22D3A3',
          purple: '#9B7EFF',
          blue: '#5D9CFF',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'sidebar': '-4px 0 20px rgba(0, 0, 0, 0.05)',
        'primary': '0 4px 14px 0 rgba(93, 95, 239, 0.39)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
