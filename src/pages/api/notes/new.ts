import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { z } from "astro/zod";

const newNoteBodyValidator = z.object({
  name: z.string(),
});

export type NewNoteBody = z.infer<typeof newNoteBodyValidator>;

export const POST: APIRoute = async ({ locals, request }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as unknown;
  const validatedBody = newNoteBodyValidator.safeParse(body);

  if (!validatedBody.success)
    return new Response("Invalid request", { status: 400 });

  await db.insert(notes).values({
    id: crypto.randomUUID(),
    nearbyy_id: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id,
    title: validatedBody.data.name,
  });

  return new Response("ok", { status: 200 });
};
