/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A00', // burning orange
        background: '#FFFFFF', // white
        foreground: '#1A1A1A', // dark gray for text
      },
    },
  },
  plugins: [],
};
