import type { APIRoute } from "astro";
import crypto from "crypto";
import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import db from "../../../server/db/db";
import { users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

async function verifyRequest<T = unknown>(req: Request, secret: string) {
  const svixId = req.headers.get("svix-id") ?? req.headers.get("webhook-id");
  const svixTimestamp =
    req.headers.get("svix-timestamp") ?? req.headers.get("webhook-timestamp");
  const svixSignature =
    req.headers.get("svix-signature") ?? req.headers.get("webhook-signature");

  if (!svixId || !svixTimestamp || !svixSignature || !req.body) {
    return { valid: false, data: null } as const;
  }

  const rawBody = await req.text();

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(secret, "base64");

  const signature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const signatures = svixSignature.split(" ");
  for (const sig of signatures) {
    const [_, sigValue] = sig.split(",");
    if (signature === sigValue) {
      return { valid: true, data: JSON.parse(rawBody) as T } as const;
    }
  }

  return { valid: false, data: null } as const;
}

const secret = process.env.SVIX_SECRET;

if (!secret) {
  throw new Error("SVIX_SECRET is missing");
}

export const POST: APIRoute = async ({ request }) => {
  const { data: evt, valid } = await verifyRequest<WebhookEvent>(
    request,
    secret.replace("whsec_", "")
  );

  if (!valid) {
    return new Response("Invalid request", { status: 400 });
  }

  switch (evt.type) {
    case "user.created": {
      await db.insert(users).values({
        name: (evt.data.first_name || "") + " " + (evt.data.last_name || ""),
        email: evt.data.email_addresses[0]!.email_address,
        id: evt.data.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      break;
    }
    case "user.deleted": {
      await db.delete(users).where(eq(users.id, evt.data.id!));
      break;
    }
    case "user.updated": {
      await db.update(users).set({
        email: evt.data.email_addresses[0]!.email_address,
        name: (evt.data.first_name || "") + " " + (evt.data.last_name || ""),
        id: evt.data.id,
        updatedAt: new Date(),
      });
      break;
    }
  }

  return new Response("OK", { status: 200 });
};
