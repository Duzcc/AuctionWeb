/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#AA8C3C',
          50: '#F5F0E5',
          100: '#EBE3CE',
          200: '#D7C79D',
          300: '#C3AB6C',
          400: '#AF8F3B',
          500: '#AA8C3C',
          600: '#8A7030',
          700: '#6A5424',
          800: '#4A3818',
          900: '#2A1C0C',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        garamond: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'banner-zoom': 'bannerZoom 5s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'scroll': 'scroll 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bannerZoom: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
