/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  "darkMode": "class",
  theme: {
    extend: {
// colores para el dark mode
      colors: {
        'background': '#1B1B1F',
        'card' : '#474252',
        'card-footer' : '#312B3D', 
        'borders' : '#463A54',
        'sidebar' : '#232329'
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
