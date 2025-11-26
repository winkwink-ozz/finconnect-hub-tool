/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { 
          400: '#D4AF37', // Standard Gold
          500: '#C5A028', // Darker Gold for hover
          600: '#B4901E' 
        },
        obsidian: { 
          800: '#1a1a1a', // Panel Background
          900: '#0f0f0f'  // App Background
        },
        success: '#10b981', // Green for valid OCR
        warning: '#f59e0b'  // Amber for low confidence
      },
      fontFamily: { 
        sans: ['Inter', 'sans-serif'] 
      }
    },
  },
  plugins: [],
}

