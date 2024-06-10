import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  return new Response(JSON.stringify(currentUser), { status: 200 });
};
