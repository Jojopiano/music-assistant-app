/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#6860C8',
          light: '#EEEDFE',
          dark: '#3C3489',
        },
        teal: {
          DEFAULT: '#167A5A',
          light: '#E1F5EE',
          dark: '#085041',
        },
        amber: {
          DEFAULT: '#8A5400',
          light: '#FAEEDA',
          dark: '#633806',
        },
        coral: {
          DEFAULT: '#A83A14',
          light: '#FAECE7',
          dark: '#4A1B0C',
        },
        pink: {
          DEFAULT: '#D4537E',
          light: '#FBEAF0',
        },
      },
    },
  },
  plugins: [],
}
