/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Font có hỗ trợ đầy đủ dấu tiếng Việt; "Times New Roman" làm dự phòng
        serif: ['"Playfair Display"', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};