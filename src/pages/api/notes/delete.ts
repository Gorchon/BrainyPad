import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { NearbyyClient } from "@nearbyy/core";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

const newDeleteContentValidator = z.object({
  id: z.string(),
});

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const DELETE: APIRoute = async ({ locals, request }) => {
  let errorResponse = null;

  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const body = (await request.json()) as unknown;
    const validatedBody = newDeleteContentValidator.safeParse(body);

    if (!validatedBody.success)
      return new Response("Invalid request", { status: 400 });

    if (!validatedBody.data)
      return new Response("Cannot access file id", { status: 400 });

    const { id } = validatedBody.data;

    const note = await db.select().from(notes).where(eq(notes.id, id));

    let nearbyyId;
    if (note && note.length) {
      nearbyyId = note[0].nearbyy_id;
    } else {
      return new Response("Note not found in databse", { status: 404 });
    }

    // Check if note exists in nearbyy, if so, delete it
    if (nearbyyId && nearbyyId !== "") {
      try {
        const deleteRes = await nearbyy.deleteFiles({ ids: [nearbyyId] });
        if (!deleteRes.success) {
          errorResponse = {
            success: false,
            message: "Failed to delete file",
            error: deleteRes,
          };
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }

    //Delete from local db
    const deleteResult = await db.delete(notes).where(eq(notes.id, id));

    if (!deleteResult) {
      return new Response("Failed to delete note from database", {
        status: 500,
      });
    }

    if (errorResponse) {
      return new Response(JSON.stringify(errorResponse), {
        status: 207,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};