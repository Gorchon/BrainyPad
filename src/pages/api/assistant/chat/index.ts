import { NearbyyClient } from "@nearbyy/core";
import type { APIRoute } from "astro";
import OpenAI from "openai";
import db from "../../../../server/db/db";
import { and, eq } from "drizzle-orm";
import {
  conversations,
  files,
  messages,
  notes,
} from "../../../../server/db/schema";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

if (!nearbyy_key) {
  throw new Error("Missing Nearbyy API key");
}

const open_ai_key = import.meta.env.OPEN_AI_API_KEY;

if (!open_ai_key) {
  throw new Error("Missing OpenAI API key");
}

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key as string,
});

const openai = new OpenAI({
  apiKey: open_ai_key as string,
});

export interface Reference {
  title: string;
  id: string;
  type: "file" | "note";
}

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const urlParams = new URLSearchParams(request.url.split("?")[1]);

  const message = urlParams.get("message");

  let conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.userId, currentUser.id),
      eq(conversations.default, true)
    ),
  });

  if (!conversation) {
    // we need to create a new one
    conversation = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      fileId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      noteId: null,
      default: true,
    };

    await db.insert(conversations).values(conversation);
  }

  if (!conversation)
    return new Response("Conversation not found", { status: 404 });

  // Now, we need to find all the messages for this conversation
  const convMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversation.id),
    orderBy: (msgs, { asc }) => asc(msgs.createdAt),
  });

  if (!message) {
    return new Response(JSON.stringify({ messages: convMessages }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const context = await nearbyy.semanticSearch({
    limit: 15,
    query: message,
    tag: currentUser.id,
  });

  if (!context.success)
    return new Response("Error fetching context", { status: 500 });

  const contextMsg = context.data.items
    .map(
      (chunk) => `file_id: ${chunk._extras.fileId}\nchunk_text: ${chunk.text}`
    )
    .join("---\n\n");

  const { fileId, response } = await makeAIResponse(
    contextMsg,
    message,
    convMessages.map((msg) => ({
      content: msg.content,
      role: msg.wasFromAi ? "assistant" : "user",
    }))
  );

  console.log("response", response);
  console.log("fileId", fileId);

  const newMessages = await db
    .insert(messages)
    .values([
      {
        id: crypto.randomUUID(),
        content: message,
        wasFromAi: false,
        conversationId: conversation.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        content: response,
        wasFromAi: true,
        conversationId: conversation.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  const updatedMessages = [...convMessages, ...newMessages];

  const maybeFileReferenced = await db.query.files.findFirst({
    where: eq(files.nearbyy_id, fileId),
  });

  const maybeNoteReferenced = await db.query.notes.findFirst({
    where: eq(notes.nearbyy_id, fileId),
  });

  const reference: Reference | undefined = maybeFileReferenced
    ? {
        title: maybeFileReferenced.name ?? "Missing title",
        id: maybeFileReferenced.id,
        type: "file",
      }
    : maybeNoteReferenced
    ? {
        title: maybeNoteReferenced.title ?? "Missing title",
        id: maybeNoteReferenced.id,
        type: "note",
      }
    : undefined;

  return new Response(
    JSON.stringify({
      messages: updatedMessages,
      reference,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};

async function makeAIResponse(
  context: string,
  message: string,
  oldMessages: { content: string; role: "user" | "system" | "assistant" }[] = []
) {
  const prompt = `You are a helpful assistant, and will respond 
     to questions from the user using information from the file. 
     The system will provide context from the parts of the file 
     that is relevant to the user's question. Respond with JSON in
     the format { "response": "your response here", "fileId": "the-file-id-of-your-source" }`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: prompt },
    { role: "system", content: context },
    ...oldMessages,
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    response_format: { type: "json_object" },
  });

  const maybeJSON = response.choices[0].message.content ?? "";
  return JSON.parse(maybeJSON) as { response: string; fileId: string };
}
