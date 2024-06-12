import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { conversations, messages } from "../../../server/db/schema";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";

const newDeleteContentValidator = z.object({
  id: z.string(),
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
      return new Response("Cannot find conversation by given id", {
        status: 400,
      });

    const { id } = validatedBody.data;

    // Delete messages that reference the conversation
    await db.delete(messages).where(eq(messages.conversationId, id));

    // Delete the conversation
    const deleteResult = await db
      .delete(conversations)
      .where(eq(conversations.id, id));

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
