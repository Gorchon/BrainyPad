import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { conversations, messages } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

export const DELETE: APIRoute = async ({ locals, request, params }) => {
  let errorResponse = null;

  try {
    const currentUser = await locals.currentUser();
    if (!currentUser) return new Response("Unauthorized", { status: 401 });

    const id = params.id!;

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
