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
          DEFAULT: '#7F77DD',
          light: '#EEEDFE',
          dark: '#3C3489',
        },
        teal: {
          DEFAULT: '#1D9E75',
          light: '#E1F5EE',
          dark: '#085041',
        },
        amber: {
          DEFAULT: '#BA7517',
          light: '#FAEEDA',
          dark: '#633806',
        },
        coral: {
          DEFAULT: '#D85A30',
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
