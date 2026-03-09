/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // iOS Palette
        ios: {
          bg: '#F5F5F7',
          blue: '#007AFF',
          gray: '#8E8E93',
          lightGray: '#D1D1D6',
          darkText: '#1C1C1E',
          red: '#FF3B30',
          black: '#000000',
        }
      },
      boxShadow: {
        'soft': '0 4px 24px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
