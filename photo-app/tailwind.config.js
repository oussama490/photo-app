/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        roseCandy: '#fbcfe8',
        violetBubble: '#c4b5fd',
        instaPink: '#ec4899',
        instaPurple: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
