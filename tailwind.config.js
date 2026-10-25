/** @type {import('tailwindcss').Config} */

// Hệ màu "biển": dịu, đậm vừa phải, nhiều sắc nhưng không chói, không tím.
// Giữ nguyên tên lớp cũ (teal, cyan, violet, orange, ...) nên chỉ cần đổi giá trị ở đây.

// Xanh ngọc biển (màu chủ đạo, trước là "teal")
const brand = { 50: '#eff8f8', 100: '#d9eeee', 200: '#b5dcdd', 300: '#86c3c6', 400: '#55a5ab', 500: '#37898f', 600: '#2a6f76', 700: '#265a60', 800: '#244a4f', 900: '#233e42', 950: '#10272b' };
// Xanh đại dương
const ocean = { 50: '#f0f6fa', 100: '#dbe9f2', 200: '#bad5e6', 300: '#8fb9d4', 400: '#5f98bc', 500: '#417ba2', 600: '#346286', 700: '#2f506c', 800: '#2c445a', 900: '#293a4c', 950: '#18242f' };
// Xanh rêu / sage (thay cho tím)
const sage = { 50: '#f2f8f4', 100: '#e0eee5', 200: '#c2ddcc', 300: '#98c4aa', 400: '#6fa88a', 500: '#538d70', 600: '#417258', 700: '#365c48', 800: '#2f4a3b', 900: '#293e33', 950: '#142219' };
// San hô dịu (điểm nhấn ấm)
const coral = { 50: '#fdf5f1', 100: '#fae6dc', 200: '#f4cdb9', 300: '#eaaa8c', 400: '#de8663', 500: '#cd6b47', 600: '#b0553a', 700: '#8e4430', 800: '#733a2c', 900: '#5f3328', 950: '#34180f' };
// Hồng đất / dusty rose
const dusty = { 50: '#fbf5f3', 100: '#f6e7e3', 200: '#eccfc8', 300: '#dfaea4', 400: '#cf8a7e', 500: '#bb6c61', 600: '#9f554d', 700: '#824540', 800: '#6b3c38', 900: '#5a3532', 950: '#301a19' };
const rose = { 50: '#fbf1f1', 100: '#f7e1e1', 200: '#efc7c7', 300: '#e3a3a3', 400: '#d67b7b', 500: '#c75c5f', 600: '#ad4549', 700: '#8f3a3d', 800: '#753336', 900: '#622f32', 950: '#35171a' };
// Cát
const sand = { 50: '#fbf8f0', 100: '#f4ecd6', 200: '#e9d8a9', 300: '#dbbf73', 400: '#cba44b', 500: '#b48a30', 600: '#956e26', 700: '#775624', 800: '#624824', 900: '#523d22', 950: '#2e2010' };
// Xám trung tính ngả xanh biển rất nhẹ
const gray = { 50: '#f8f9f9', 100: '#f0f2f2', 200: '#e2e6e6', 300: '#cdd3d4', 400: '#9aa5a8', 500: '#6a777b', 600: '#4c5a5e', 700: '#38464a', 800: '#26343a', 900: '#172127', 950: '#0a1013' };

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: brand, indigo: brand,
        cyan: ocean, sky: ocean, blue: ocean,
        violet: sage, purple: sage, fuchsia: sage, emerald: sage,
        orange: coral, pink: dusty,
        rose, amber: sand, yellow: sand, gray,
        ink: '#12262b',
        paper: '#f9faf9',
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
        marquee: 'marquee 40s linear infinite',
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};