/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark: '#0e1117',
          card: '#161b22',
          cardHover: '#1f2633',
          border: '#30363d',
          gold: '#c59b27',
          goldLight: '#e4ba43',
          crimson: '#b91c1c',
          cream: '#f8f5ee',
          muted: '#8b949e',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
