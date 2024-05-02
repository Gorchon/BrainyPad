import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react({
    include: ["**/react/*"]
  }), solidJs({
    include: ["**/solid/*"]
  }), svelte(), vue()],
  output: "server",
  adapter: vercel()
});