/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  "darkMode": "class",
  theme: {
    extend: {
// colores para el dark mode
      colors: {
        'background': '#1D1B22',
        'card' : '#474252',
        'card-footer' : '#312B3D', 
        'borders' : '#463954',
        'sidebar' : '#232329',
        'chat' : '#3E3B47',
        'message' : '#2D2A35',
        '.toggle__dot': {
          'top': '-1px',
          'left': '-1px',
          'transition': 'all 0.3s ease-in-out',
        },
        '.toggle__line':{
          'transition': 'background 0.3s ease-in-out',
        }
        
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
