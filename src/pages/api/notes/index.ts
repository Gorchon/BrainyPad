import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals }) => {
  const currentUser = await locals.currentUser();

  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const usersNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, currentUser.id));

  return new Response(JSON.stringify(usersNotes), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
