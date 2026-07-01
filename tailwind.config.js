/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'lgn-pink': '#FFBEFA',
        'lgn-green': '#26B743',
        'lgn-dark': '#232323',
        'lgn-cream': '#FAF5ED',
      },
    },
  },
  plugins: [],
};
