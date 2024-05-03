import { pgTable, serial, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }),
  name: text('name'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const files = pgTable('files', {
  id: varchar('id', { length: 256 }).primaryKey(),
  userId: integer('user_id'),
  name: text('name'),
  type: varchar('type', { length: 256 }),
  media: varchar('media', { length: 256 }),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  title: varchar('title', { length: 256 }),
  content: text('content'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  noteId: varchar('note_id', { length: 256 }),
  fileId: varchar('file_id', { length: 256 }),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
