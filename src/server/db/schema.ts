import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email", { length: 256 }),
  name: text("name"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const files = pgTable("files", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  type: varchar("type", { length: 256 }),
  media: varchar("media", { length: 256 }),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title", { length: 256 }),
  content: text("content"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  noteId: varchar("note_id", { length: 256 }).references(() => notes.id),
  fileId: varchar("file_id", { length: 256 }).references(() => files.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
