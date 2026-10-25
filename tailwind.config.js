/** @type {import('tailwindcss').Config} */

// Hệ màu mới: nền sáng, màu nhấn xanh chàm (indigo) dịu + xanh trời nhạt, điểm xuyết đào nhẹ.
// Giữ nguyên tên lớp cũ (teal, orange, cyan, ...) để không phải sửa hàng trăm chỗ trong code:
// chỉ cần đổi giá trị ở đây là toàn bộ giao diện đổi theo.

// Màu chủ đạo (trước là "teal"): xanh chàm dịu
const brand = {
  50: '#f1f4ff',
  100: '#e4eaff',
  200: '#cdd8ff',
  300: '#aebdfb',
  400: '#8999f2',
  500: '#6877e6',
  600: '#5462d3',
  700: '#464fb7',
  800: '#3b4296',
  900: '#343b78',
  950: '#1f2350',
};

// Xanh trời / ngọc nhạt: màu phụ trong gradient
const sky = {
  50: '#f1fafc',
  100: '#dbf1f7',
  200: '#b8e3ee',
  300: '#88cfe1',
  400: '#58b8d0',
  500: '#39a0ba',
  600: '#2c819b',
  700: '#2a6a7f',
  800: '#2b5668',
  900: '#284959',
  950: '#142f3b',
};

// Oải hương: thay cho tím/fuchsia cũ
const lavender = {
  50: '#f7f5ff',
  100: '#eeeaff',
  200: '#e0daff',
  300: '#c8bffb',
  400: '#a99af5',
  500: '#8d7aec',
  600: '#7a5fdd',
  700: '#6849c0',
  800: '#563d9c',
  900: '#47377c',
  950: '#2b2150',
};

// Đào nhạt: điểm nhấn ấm, thay cho cam gắt
const peach = {
  50: '#fff7f2',
  100: '#ffeadf',
  200: '#fdd3bd',
  300: '#f9b595',
  400: '#f1946c',
  500: '#e47a52',
  600: '#cd6340',
  700: '#aa4f34',
  800: '#8a4230',
  900: '#703929',
  950: '#3d1b12',
};

// Hồng phấn
const blush = {
  50: '#fff6f9',
  100: '#ffe9f0',
  200: '#fdd2e0',
  300: '#f9b2c9',
  400: '#f08aac',
  500: '#e2658f',
  600: '#c94c78',
  700: '#a63e62',
  800: '#873654',
  900: '#712f49',
  950: '#411629',
};

// Đỏ hồng (trái tim "thích", cảnh báo nhẹ): bớt chói
const rose = {
  50: '#fff1f3',
  100: '#ffe2e7',
  200: '#ffc9d2',
  300: '#ffa2b1',
  400: '#fb748b',
  500: '#ec5670',
  600: '#d63d5b',
  700: '#b52f4a',
  800: '#97293f',
  900: '#7f263c',
  950: '#450f1d',
};

const amber = {
  50: '#fffaf0',
  100: '#fef1d3',
  200: '#fbe1a6',
  300: '#f5cc74',
  400: '#edb647',
  500: '#da9c2a',
  600: '#bc7d1d',
  700: '#976019',
  800: '#7b4c1b',
  900: '#663f1a',
  950: '#3a2209',
};

const yellow = {
  50: '#fffdf1',
  100: '#fcf6d2',
  200: '#f9eca3',
  300: '#f3de6e',
  400: '#ebcb45',
  500: '#d6b02f',
  600: '#b28a25',
  700: '#8c6b22',
  800: '#745623',
  900: '#634924',
  950: '#3a280e',
};

const blue = {
  50: '#f2f7ff',
  100: '#e2edff',
  200: '#c8dcfd',
  300: '#9fc2f9',
  400: '#6fa2f1',
  500: '#4f85e3',
  600: '#3e6cca',
  700: '#3557a5',
  800: '#304a85',
  900: '#2d416c',
  950: '#1d2a47',
};

// Xám ngả xanh (slate): hiện đại, sạch hơn xám trung tính
const gray = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: brand,
        indigo: brand,
        cyan: sky,
        sky,
        violet: lavender,
        purple: lavender,
        fuchsia: lavender,
        orange: peach,
        pink: blush,
        rose,
        amber,
        yellow,
        blue,
        gray,
        // Màu riêng của giao diện
        ink: '#151a33', // chữ đậm ngả xanh than
        paper: '#f7f8fc', // nền trang: trắng ngả xanh rất nhạt
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