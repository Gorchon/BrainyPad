import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { NearbyyClient } from "@nearbyy/core";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

const newDeleteContentValidator = z.object({
  id: z.string(),
  nearbyyId: z.string(),
});

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const DELETE: APIRoute = async ({ locals, request }) => {
  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const body = (await request.json()) as unknown;
    const validatedBody = newDeleteContentValidator.safeParse(body);

    if (!validatedBody.success)
      return new Response("Invalid request", { status: 400 });

    if (!validatedBody.data)
      return new Response("Cannot access file id", { status: 400 });

    const { id, nearbyyId } = validatedBody.data;

    // Delete from nearby
    const res = await nearbyy.deleteFiles({
      ids: [nearbyyId],
    });

    if (!res.success) {
      console.error(res.error);
      return new Response("Cannot delete file from nearby", { status: 500 });
    }

    //Delete from local db
    const deleteResult = await db.delete(notes).where(eq(notes.id, id));

    if (!deleteResult) {
      return new Response("Failed to delete note from database", {
        status: 500,
      });
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
