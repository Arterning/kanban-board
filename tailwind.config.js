/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor": '#0D1117',
        "columnBackgroundColor": '#161C22'
      },
      gridTemplateColumns: {
        '30': 'repeat(30, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}

