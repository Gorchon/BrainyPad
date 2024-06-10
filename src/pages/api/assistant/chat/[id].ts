import type { APIRoute } from "astro";
import db from "../../../../server/db/db";
import { and, eq, isNull, or } from "drizzle-orm";
import {
  conversations,
  files,
  messages,
  notes,
} from "../../../../server/db/schema";
import { NearbyyClient } from "@nearbyy/core";
import { OpenAI } from "openai";

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

export interface FileReference {
  title: string;
  id: string;
  refCount: number;
}

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const id = params.id!;

  const urlParams = new URLSearchParams(request.url.split("?")[1]);

  const message = urlParams.get("message");
  const idType = urlParams.get("type");

  if (!idType && id !== "all") {
    return new Response("Missing type. Valid values are 'file' or 'note'", {
      status: 400,
    });
  }

  let conversation = await db.query.conversations.findFirst({
    where:
      id !== "all"
        ? and(
            eq(conversations.userId, currentUser.id),
            or(eq(conversations.fileId, id), eq(conversations.noteId, id))
          )
        : and(
            eq(conversations.userId, currentUser.id),
            and(isNull(conversations.fileId), isNull(conversations.noteId))
          ),
  });

  if (!conversation) {
    if (idType === "file") {
      const file = await db.query.files.findFirst({
        where: eq(files.id, id),
      });

      if (!file) {
        return new Response("File not found", { status: 404 });
      }

      conversation = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        fileId: file.id,
        updatedAt: new Date(),
        createdAt: new Date(),
        noteId: null,
      };

      // create the conversation
      await db.insert(conversations).values(conversation);
    }

    if (idType === "note") {
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, id),
      });

      if (!note) {
        return new Response("Note not found", { status: 404 });
      }

      conversation = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        fileId: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        noteId: note.id,
      };

      // create the conversation
      await db.insert(conversations).values(conversation);
    }

    if (id === "all") {
      conversation = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        fileId: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        noteId: null,
      };

      // create the conversation
      await db.insert(conversations).values(conversation);
    }
  }

  // This just tells ts that this will be defined
  conversation = conversation!;

  // now, we need to find all the messages in this conversation
  const convMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversation.id),
    orderBy: (msgs, { asc }) => asc(msgs.createdAt),
  });

  if (!message) {
    return new Response(
      JSON.stringify(
        {
          messages: convMessages,
          referencedFiles: [] as FileReference[],
        },
        null,
        2
      ),
      {
        headers: { "content-type": "application/json" },
        status: 200,
      }
    );
  }

  if (idType === "file" || id === "all") {
    const context =
      id === "all"
        ? await nearbyy.semanticSearch({
            limit: 10,
            query: message,
            tag: currentUser.id,
          })
        : await nearbyy.semanticSearch({
            limit: 10,
            query: message,
            fileId: id,
          });

    if (!context.success)
      return new Response("Failed to get context", { status: 500 });

    const contextMsg = context.data.items
      .map((chunk) => `chunk_id: ${chunk.chunkId}\nchunk_text: ${chunk.text}`)
      .join("---\n\n");

    const aiResponse = await makeAIResponse(
      contextMsg,
      message,
      convMessages.map((msg) => ({
        content: msg.content,
        role: msg.wasFromAi ? "assistant" : "user",
      }))
    );

    let referencedFiles: FileReference[] = [];

    if (context.data.items && context.data.items.length > 0) {
      console.log(context.data.items);

      // Create a map to count the occurrences of each fileId
      const fileIdCounts = context.data.items.reduce(
        (acc: { [key: string]: number }, item) => {
          acc[item._extras.fileId] = (acc[item._extras.fileId] || 0) + 1;
          return acc;
        },
        {}
      );

      // Get unique fileIds
      const uniqueFileIds = Object.keys(fileIdCounts);

      // Fetch files from the database for each unique fileId
      const filePromises = uniqueFileIds.map(async (fileId) => {
        const file = await db
          .select({ name: files.name })
          .from(files)
          .where(eq(files.id, fileId));

        const { name } = file[0];

        return {
          title: name ?? "",
          id: fileId,
          refCount: fileIdCounts[fileId],
        };
      });

      referencedFiles = await Promise.all(filePromises);
    }

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
          content: aiResponse,
          wasFromAi: true,
          conversationId: conversation.id,
          createdAt: new Date(new Date().getTime() + 100), // Add 100 ms delay
          updatedAt: new Date(new Date().getTime() + 100), // Add 100 ms delay
        },
      ])
      .returning();

    const updatedMessages = [...convMessages, ...newMessages];

    return new Response(
      JSON.stringify(
        { messages: updatedMessages, referencedFiles: referencedFiles },
        null,
        2
      ),
      {
        headers: { "content-type": "application/json" },
        status: 200,
      }
    );
  } else {
    return new Response("Unsupported type", { status: 400 });
  }
};

async function makeAIResponse(
  context: string,
  message: string,
  oldMessages: { content: string; role: "user" | "system" | "assistant" }[] = []
) {
  const prompt = `You are a helpful assistant, and will respond 
     to questions from the user using information from the file. 
     The system will provide context from the parts of the file 
     that is relevant to the user's question.`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: prompt },
    { role: "system", content: context },
    ...oldMessages,
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  return response.choices[0].message.content ?? "";
}
