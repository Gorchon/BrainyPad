import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { notes } from "../../../server/db/schema";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { NearbyyClient } from "@nearbyy/core";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

const newContentBodyValidator = z.object({
  id: z.string(),
  nearbyyId: z.string().optional(),
  content: z.string(),
});

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const body = (await request.json()) as unknown;
    const validatedBody = newContentBodyValidator.safeParse(body);

    if (!validatedBody.success)
      return new Response("Invalid request", { status: 400 });

    const { id, nearbyyId, content: markdownContent } = validatedBody.data;
    const markdownFile = new File([markdownContent], `${id}.md`, {
      type: "text/markdown",
    });

    if (nearbyyId && nearbyyId !== "") {
      const deleteRes = await nearbyy.deleteFiles({ ids: [id] });
      if (!deleteRes.success)
        return new Response("File could not be deleted from nearbyy", {
          status: 500,
        });
    }

    const res = await nearbyy.uploadFiles({
      files: [markdownFile],
      tag: currentUser.id,
    });

    if (!res.success)
      return new Response("Failed to update file", { status: 500 });

    const updateResult = await db
      .update(notes)
      .set({ content: markdownContent, nearbyy_id: id })
      .where(eq(notes.id, id));

    if (!updateResult)
      return new Response("Failed to update note in database", { status: 500 });

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
