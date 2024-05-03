import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/* if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}
 */
const connectionString = "postgres://postgres.cqqmxosfafldprwsbank:[nTH6YCqUqZiaLMaaVxuyCn8YuZjgL4hz]@aws-0-us-west-1.pooler.supabase.com:5432/postgres";
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export default db;