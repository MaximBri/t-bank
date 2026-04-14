/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // mobile default
        h1: ['28px', { lineHeight: '36px' }],
        h2: ['24px', { lineHeight: '30px' }],
        h3: ['16px', { lineHeight: '26px' }],
        body: ['16px', { lineHeight: '24px' }],
        small: ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],

        // desktop tokens
        'h1-d': ['32px', { lineHeight: '40px' }],
        'h2-d': ['24px', { lineHeight: '32px' }],
        'h3-d': ['20px', { lineHeight: '28px' }],
      },
      colors: {
        yellow: '#ffdd2d',
        primary: '#f3f4f6',
        secondary: '#ffffff',
        'yellow-disabled': '#ffeb83',
        error: '#f6465d',
        'error-light': '#fff1f1',
        'green-light': '#eaf8e8',
      },
      textColor: {
        primary: '#000000',
        placeholder: '#999999',
        muted: '#666666',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderColor: {
        yellow: '#ffe566',
        primary: '#c1c1c1',
      },
      spacing: {
        medium: '30px',
      },
    },
  },
  plugins: [],
}
