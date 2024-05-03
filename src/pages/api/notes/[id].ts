import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const id = params.id!;

  const notesQuery = await db.select().from(notes).where(eq(notes.id, id));
  const note = notesQuery[0];

  if (!note) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(note), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
