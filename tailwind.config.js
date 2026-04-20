/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-teal': '#0d9488', // tailwind teal-600
        'brand-teal-dark': '#0f766e', // tailwind teal-700
      }
    },
  },
  plugins: [],
}
