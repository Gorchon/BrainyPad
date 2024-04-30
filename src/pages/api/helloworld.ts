import type { APIRoute } from "astro";
import { allUsers } from "../../server/queries/getAllUsers";

export const GET: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "Que pedo genteeeeeeeeeee. Todos con las manos en el aire",
      users: allUsers,
    }),
    {status:200,  headers: { "content-type": "application/json" } }
  );
};
