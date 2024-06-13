import type { APIRoute } from "astro";
import db from "../../../../server/db/db";
import { eq } from "drizzle-orm";
import { files, notes } from "../../../../server/db/schema";
import { NearbyyClient } from "@nearbyy/core";
import OpenAI from "openai";

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

  const message = urlParams.get("message");
  const id = params.id!;

  const maybeFile = await db.query.files.findFirst({
    where: eq(files.id, id),
  });

  const maybeNote = await db.query.notes.findFirst({
    where: eq(notes.id, id),
  });

  if (!maybeFile && !maybeNote) {
    return new Response("Not found", { status: 404 });
  }

  let nearbyy_id: string | null = null;
  let name: string | null = null;
  if (maybeFile) {
    nearbyy_id = maybeFile.id;
    name = maybeFile.name;
  } else if (maybeNote) {
    nearbyy_id = maybeNote.nearbyy_id;
    name = maybeNote.title;
  }

  if (!nearbyy_id) {
    return new Response("Not found", { status: 404 });
  }

  const context = await nearbyy.semanticSearch({
    limit: 20,
    query: `Information about ${name ?? "this item"}`,
    fileId: nearbyy_id,
  });

  if (!context.success)
    return new Response("Failed to get context", { status: 500 });

  const ctxMessage = context.data.items
    .map((chunk) => ({
      order: chunk.order,
      text: chunk.text,
    }))
    .sort((a, b) => a.order - b.order)
    .map((chunk) => `[CHUNK ${chunk.order}]: ${chunk.text}`)
    .join("\n");

  const questions = await makeAIResponse(ctxMessage, message);

  return new Response(JSON.stringify(questions), {
    headers: { "content-type": "application/json" },
  });
};

async function makeAIResponse(context: string, message: string | null) {
  const prompt = `You are an AI designed to make some quizzes to help a
  student learn content better. You will be given a context on a topic, and
  your job is to generate a three question quiz based on the context. Each
  question has 4 possible answers, and only one is correct. The output format 
  should be json with this format: {
    "questions": [
      {
        "question": "What is the capital of France?",
        "options": [
          { "option": "Paris", "correct": true },
          { "option": "London", "correct": false },
          { "option": "Berlin", "correct": false },
          { "option": "Madrid", "correct": false },
        ]
      }
      // The other two questions follow the same format...
    ]
  }`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: prompt },
    { role: "system", content: context },
  ];

  if (message) {
    messages.push({ role: "user", content: message });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    response_format: {
      type: "json_object",
    },
  });

  const maybeJson = response.choices[0].message.content ?? "";
  return JSON.parse(maybeJson) as {
    questions: {
      question: string;
      options: { option: string; correct: boolean }[];
    }[];
  };
}
