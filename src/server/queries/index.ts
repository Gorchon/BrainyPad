import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../db/schema';

const connectionString = 'postgres://postgres.cqqmxosfafldprwsbank:[nTH6YCqUqZiaLMaaVxuyCn8YuZjgL4hz]@aws-0-us-west-1.pooler.supabase.com:5432/postgres'

const client = postgres(connectionString!)
const db = drizzle(client);

export const allUsers = await db.select().from(users);