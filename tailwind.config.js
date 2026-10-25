/** @type {import('tailwindcss').Config} */

// Thang tím–fuchsia: màu chủ đạo. Các chỗ cũ dùng "teal" sẽ tự đổi sang tím.
const pop = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // teal cũ -> tím; orange, cyan, sky, amber, rose, red dùng đúng màu mặc định của Tailwind (tươi, sặc sỡ)
        teal: pop,
        // Màu riêng của giao diện
        ink: '#1b1035', // chữ đậm tông tím than
        paper: '#fbf7ff', // nền trang, hơi ngả tím
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        // font-serif cũ (tiêu đề, tên, số) giờ là Lexend: tròn, hiện đại
        serif: ['Lexend', '"Be Vietnam Pro"', 'sans-serif'],
        display: ['Lexend', '"Be Vietnam Pro"', 'sans-serif'],
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
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -24px, 0) scale(1.06)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};