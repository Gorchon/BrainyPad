import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email", { length: 256 }),
  name: text("name"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const files = pgTable("files", {
  id: varchar("id", { length: 256 }).primaryKey(),
  nearbyy_id: varchar("nearbyy_id"),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  type: varchar("type", { length: 256 }),
  media: varchar("media", { length: 256 }),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey(),
  nearbyy_id: varchar("nearbyy_id"),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title", { length: 256 }),
  content: text("content"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  fileId: varchar("file_id").references(() => files.id),
  noteId: varchar("note_id").references(() => notes.id),
  default: boolean("default").default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  content: text("content").notNull(),
  wasFromAi: boolean("was_from_ai").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  conversationId: varchar("conversation_id").references(() => conversations.id),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  noteId: varchar("note_id", { length: 256 }).references(() => notes.id),
  fileId: varchar("file_id", { length: 256 }).references(() => files.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
