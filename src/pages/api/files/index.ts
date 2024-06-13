import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { files } from "../../../server/db/schema";
import { desc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals }) => {
  const currentUser = await locals.currentUser();

  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const usersFiles = await db
    .select()
    .from(files)
    .where(eq(files.userId, currentUser.id))
    .orderBy(desc(files.updatedAt));

  return new Response(JSON.stringify(usersFiles), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
