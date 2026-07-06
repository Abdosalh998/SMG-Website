/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E60000', // Premium Red
        secondary: '#FFFFFF', // White
        dark: '#111111',
        light: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'], // Inter for EN, Cairo for AR
      }
    },
  },
  plugins: [],
}
