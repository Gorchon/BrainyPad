import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { NearbyyClient } from "@nearbyy/core";
import { error } from "console";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

const newContentBodyValidator = z.object({
  id: z.string(),
  content: z.string(),
});

export type ContentBody = z.infer<typeof newContentBodyValidator>;

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const POST: APIRoute = async ({ locals, request }) => {
  let errorResponse = null;

  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const body = (await request.json()) as unknown;
    const validatedBody = newContentBodyValidator.safeParse(body);

    if (!validatedBody.success)
      return new Response("Invalid request", { status: 400 });

    const { id, content: markdownContent } = validatedBody.data;
    const markdownFile = new File([markdownContent], `${id}.md`, {
      type: "text/markdown",
    });

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

    // Upload file into nearby
    try {
      const res = await nearbyy.uploadFiles({
        files: [markdownFile],
        tag: currentUser.id,
      });

      if (!res.success) {
        errorResponse = {
          success: false,
          message: "Failed to update file",
          error: res,
        };
      }

      nearbyyId = res.data.files[0].id;
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    // Update note in local database
    const updateResult = await db
      .update(notes)
      .set({ content: markdownContent, nearbyy_id: nearbyyId })
      .where(eq(notes.id, id));

    if (!updateResult)
      return new Response("Failed to update note in database", {
        status: 500,
      });

    if (errorResponse) {
      return new Response(JSON.stringify(errorResponse), {
        status: 207,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Update correctly executed", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
