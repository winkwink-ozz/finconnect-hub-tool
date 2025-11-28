/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // 🎨 THE PREMIUM GRADIENT
        'gold-gradient': 'linear-gradient(145deg, #F0D788, #DDAA33)', 
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      colors: {
        gold: {
          400: '#D4AF37', 
          500: '#C5A028',
        },
        obsidian: {
          800: '#1a1a1a',
          900: '#0f0f0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
