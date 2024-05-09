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
        'borders' : '#310A5D',
        'sidebar' : '#161618', //posible color para la sidebar
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
