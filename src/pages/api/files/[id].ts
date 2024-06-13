import type { APIRoute } from "astro";
import db from "../../../server/db/db";
import { files } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const id = params.id!;

  const filesQuery = await db.select().from(files).where(eq(files.id, id));
  const file = filesQuery[0];

  if (!file) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(file), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};

import { conversations, messages } from "../../../server/db/schema";
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

    const deleteRes = await nearbyy.deleteFiles({ ids: [id] });
    if (!deleteRes.success) {
      errorResponse = {
        success: false,
        message: "Failed to delete file from Nearbyy",
        error: deleteRes,
      };
    }

    let conversationIds = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.fileId, id));

    // Delete messages that reference the conversation
    for (let conversationId of conversationIds) {
      await db
        .delete(messages)
        .where(eq(messages.conversationId, conversationId.id));
    }

    // Delete referencing conversations first
    const deleteConversationsResult = await db
      .delete(conversations)
      .where(eq(conversations.fileId, id));

    if (!deleteConversationsResult) {
      return new Response(
        "Failed to delete referencing conversations from database",
        {
          status: 500,
        }
      );
    }

    // Then delete the file
    const deleteResult = await db.delete(files).where(eq(files.id, id));

    if (!deleteResult) {
      return new Response("Failed to delete file from database", {
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
