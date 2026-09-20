/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          soft: '#B9A7E8',
          deep: '#765A9E',
          pale: '#D8C8F0', // Secondary text
          mist: '#F7F0FF', // Primary light text
          dark: '#4A3B65', // Secondary dark surface
          accent: '#7965A3',
        },
        rose: {
          base: '#F8E3E8',
          pink: '#E8A8B8',
          dusty: '#C9798C',
          white: '#FFF7F3',
          plum: '#6B4B5A',
          soft: '#F3D7E2',
        },
        blush: '#F7DDE5',
        warmPaper: '#FFF9F3',
        plumBrown: '#3F3545',
        midnightPlum: '#272137',
        mauveGray: '#817789',
        sage: '#A9BEA5',
        sunflower: '#F3C969',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'], // for the storybook feel
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(118, 90, 158, 0.1)',
        'float': '0 8px 30px -4px rgba(118, 90, 158, 0.15)',
      },
      animation: {
        'gentle-bounce': 'gentle-bounce 3s ease-in-out infinite',
        'slide': 'slide 1s linear infinite',
      },
      keyframes: {
        'gentle-bounce': {
          '0%, 100%': { transform: 'translateY(-2%)' },
          '50%': { transform: 'translateY(2%)' },
        },
        'slide': {
          '0%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
