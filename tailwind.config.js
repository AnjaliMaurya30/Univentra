/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFB800',
          foreground: '#2C2200',
          light: '#FFE6A2',
          orange: '#FF8A00',
          purple: '#7A4DFF',
          pink: '#FF4DBA',
          blue: '#1F7DFF',
          cyan: '#49D6FF',
        },
        ink: {
          DEFAULT: '#333333',
          soft: '#676767',
          faint: '#8A8A8A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F7F9',
          soft: '#EDEDED',
          dark: '#121212',
        },
        success: '#0FA968',
        danger: '#E63D45',
        warning: '#FFB800',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 38px rgba(23, 23, 23, 0.08)',
        float: '0 20px 55px rgba(20, 20, 20, 0.14)',
        soft: '0 10px 24px rgba(51, 51, 51, 0.08)',
      },
      borderRadius: {
        xl2: '1.35rem',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)',
        'gradient-cool': 'linear-gradient(135deg, #1F7DFF 0%, #49D6FF 100%)',
        'gradient-pop': 'linear-gradient(135deg, #7A4DFF 0%, #FF4DBA 100%)',
        'hero-grid':
          'radial-gradient(circle at 20% 20%, rgba(255, 184, 0, 0.2), transparent 35%), radial-gradient(circle at 80% 25%, rgba(122, 77, 255, 0.16), transparent 32%), radial-gradient(circle at 55% 70%, rgba(73, 214, 255, 0.18), transparent 32%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bell: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(12deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(8deg)' },
          '80%': { transform: 'rotate(-6deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        bell: 'bell 0.8s ease-in-out 2',
      },
    },
  },
  plugins: [],
};
