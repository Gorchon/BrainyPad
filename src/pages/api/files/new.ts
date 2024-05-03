import type { APIRoute } from "astro";
import { NearbyyClient } from "@nearbyy/core";
import db from "../../../server/db/db";
import { files } from "../../../server/db/schema";

const nearbyy_key = import.meta.env.NEARBYY_API_KEY;

if (!nearbyy_key) {
  throw new Error("Missing Nearbyy API key");
}

const nearbyy = new NearbyyClient({
  API_KEY: nearbyy_key,
});

export const POST: APIRoute = async ({ locals, request }) => {
  const currentUser = await locals.currentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const fileValue = file?.valueOf();

  if (!(fileValue instanceof File))
    return new Response("Invalid request", { status: 400 });

  const res = await nearbyy.uploadFiles({
    files: [fileValue],
    tag: currentUser.id,
  });

  if (!res.success)
    return new Response("Failed to upload file", { status: 500 });

  // because this uploads a single file,
  // we only really iterate over one file
  const promises = res.data.files.map((file) => {
    return db.insert(files).values({
      id: file.id,
      name: fileValue.name,
      userId: currentUser.id,
      updatedAt: new Date(),
      createdAt: new Date(),
      media: file.url,
      type: fileValue.type,
    });
  });

  await Promise.all(promises);

  return new Response("ok", { status: 200 });
};
