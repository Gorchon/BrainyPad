import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { files } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const id = params.id!;

  const filesQuery = await db.select().from(files).where(eq(files.id, id));
  const file = filesQuery[0];

  if (!file) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(file), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
