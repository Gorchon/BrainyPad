
import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
} satisfies Config;
