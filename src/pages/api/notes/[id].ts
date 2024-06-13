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

import { z } from "astro/zod";
import { NearbyyClient } from "@nearbyy/core";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const DELETE: APIRoute = async ({ locals, request, params }) => {
  let errorResponse = null;

  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const id = params.id!;
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
