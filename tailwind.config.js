export default {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/app/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mitr: ["Mitr", "sans-serif"],
      },
      colors: {
        'primary-dark': '#2C6975',
        'primary-medium': '#68B2A0',
        'secondary-light': '#CDE0C9',
        'background-light': '#E1EDE1',
      },
    },
  },
  plugins: [],
};
