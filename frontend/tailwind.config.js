/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yellow: '#ffdd2d',
        primary: '#f3f4f6',
        secondary: '#ffffff',
        'yellow-disabled': '#ffeb83',
        error: '#f6465d'
      },
      textColor: {
        primary: '#000000',
        placeholder: '#999999',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderColor: {
        yellow: '#ffe566',
        primary: '#c1c1c1'
      },
    },
  },
  plugins: [],
}
