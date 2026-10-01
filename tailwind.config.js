/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceBorder: 'rgba(255, 255, 255, 0.1)',
        primary: {
          DEFAULT: '#00ff88',
          dim: 'rgba(0, 255, 136, 0.2)'
        },
        danger: {
          DEFAULT: '#ff3366',
          dim: 'rgba(255, 51, 102, 0.2)'
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'aurora-glow': 'radial-gradient(circle at 50% -20%, rgba(0, 255, 136, 0.15), rgba(10, 10, 10, 0) 60%)'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px'
      }
    },
  },
  plugins: [],
}
