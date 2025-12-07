export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mitr: ["Mitr", "sans-serif"],
      },
      colors: {
        'primary-dark': '#2C6975',  // สีหลักเข้ม (สำหรับพื้นหลังเข้ม, ปุ่มหลัก)
        'primary-medium': '#68B2A0', // สีกลาง (สำหรับ Accent, Icons)
        'secondary-light': '#CDE0C9', // สีรองอ่อน (สำหรับพื้นหลัง Component)
        'background-light': '#E0ECDE', // สีพื้นหลังอ่อนมาก (สำหรับพื้นหลังหลัก)
      },
    },
  },
  plugins: [],
};