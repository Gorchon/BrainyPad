// create a get astro endpoint that returns a hello world message using the astro api routes

import type { APIRoute } from "astro";

export const get: APIRoute = ({request }) => {
  return new Response(
    JSON.stringify({
      message: "Que pedo genteeeeeeeeeee, Todos con las manos en el aire"
    }),
    { status: 200 }
  );
};