import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema';


// use a env variable to get the connection string
const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString!)
const db = drizzle(client);

const allUsers = await db.select().from(users);