/** @type {import('tailwindcss').Config} */

// Thang đỏ Sting: dùng chung cho teal / rose / red để mọi chỗ cũ tự đổi sang đỏ
const sting = {
  50: '#fff1f2',
  100: '#ffe0e3',
  200: '#ffc2c9',
  300: '#ff93a0',
  400: '#ff4d63',
  500: '#f0173a',
  600: '#d4002b',
  700: '#b00024',
  800: '#8c0020',
  900: '#6b001a',
  950: '#3d000e',
};

// Thang cam lửa: dùng chung cho orange / cyan / sky / amber
const flame = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#ffb86b',
  400: '#ff8a2b',
  500: '#ff6a00',
  600: '#e65100',
  700: '#bf4000',
  800: '#933200',
  900: '#6b2600',
  950: '#3d1500',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: sting,
        rose: sting,
        red: sting,
        orange: flame,
        cyan: flame,
        sky: flame,
        amber: flame,
        // Màu riêng của giao diện
        ink: {
          DEFAULT: '#0a0a0b',
          800: '#141416',
          700: '#1c1c20',
          600: '#26262b',
        },
        volt: '#ffe600', // vàng điện để nhấn
        paper: '#f4f2ef',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        // font-serif cũ (tiêu đề, tên, số) giờ là chữ condensed đậm
        serif: ['Oswald', 'Anton', 'Impact', 'sans-serif'],
        display: ['Anton', 'Oswald', 'Impact', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        glow: 'glow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};