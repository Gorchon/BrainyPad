import type { APIRoute } from "astro";

import { NearbyyClient } from "@nearbyy/core";
import { OpenAI } from "openai";
import db from "../../../server/db/db";
import { eq } from "drizzle-orm";
import { files, notes } from "../../../server/db/schema";
import type { FileSelect, NoteSelect } from "../../../server/db/types";

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

export const GET: APIRoute = async ({ locals, request, params }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const urlParams = new URLSearchParams(request.url.split("?")[1]);

  const query = urlParams.get("q");

  if (!query) {
    return new Response("Missing query parameter", { status: 400 });
  }

  const topMatches = await nearbyy.semanticSearch({
    limit: 40,
    query,
    tag: currentUser.id,
  });

  if (!topMatches.success)
    return new Response("Error fetching results", { status: 500 });

  const fileIdAndTopChunk: Record<
    string,
    {
      chunkid: string;
      text: string;
      distance: number;
      file: FileSelect | NoteSelect;
    }
  > = {};

  const promises: Promise<void>[] = [];

  for (const item of topMatches.data.items) {
    if (!fileIdAndTopChunk[item._extras.fileId]) {
      const p = new Promise<void>(async (res, rej) => {
        let file: FileSelect | NoteSelect | undefined =
          await db.query.files.findFirst({
            where: eq(files.id, item._extras.fileId),
          });

        if (!file) {
          file = await db.query.notes.findFirst({
            where: eq(notes.nearbyy_id, item._extras.fileId),
          });
        }

        fileIdAndTopChunk[item._extras.fileId] = {
          chunkid: item.chunkId,
          text: item.text,
          distance: item._extras.distance!,
          file: file!,
        };

        res(void 0);
      });

      promises.push(p);
    }
  }

  await Promise.all(promises);

  const firstTen = topMatches.data.items.slice(0, 10);
  const contextMsg = firstTen
    .map((chunk) => `chunk_id: ${chunk.chunkId}\nchunk_text: ${chunk.text}`)
    .join("---\n\n");

  const aiResponse = await makeAIResponse(query, contextMsg);

  return new Response(
    JSON.stringify(
      {
        aiOverview: {
          response: aiResponse,
          fileId: firstTen[0]._extras.fileId,
        },
        topMatches: fileIdAndTopChunk,
      },
      null,
      2
    )
  );
};

async function makeAIResponse(query: string, context: string) {
  const prompt = `You are a search engine that helps users answer
  the questions they have using information in the database. You
  will be given a question and provide a very brief, and concise 
  answer that inmediately addresses the user's query, using only
  the information the system will provide as context.`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: prompt },
    { role: "system", content: context },
    { role: "user", content: query },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  return response.choices[0].message.content ?? "";
}
