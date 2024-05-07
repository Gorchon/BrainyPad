/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  "darkMode": "class",
  theme: {
    extend: {
// colores para el dark mode
      colors: {
        'fondo': '#000000',
        'azul' : '#150050',
        'gris' : '#463E59',
        'morado' : '#310A5D'
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
