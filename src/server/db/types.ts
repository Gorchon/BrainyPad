import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type FileSelect = InferSelectModel<typeof import("./schema").files>;
export type NoteSelect = InferSelectModel<typeof import("./schema").notes>;
export type UserSelect = InferSelectModel<typeof import("./schema").users>;
export type AttachmentsSelect = InferSelectModel<
  typeof import("./schema").attachments
>;

export type FileInsert = InferInsertModel<typeof import("./schema").files>;
export type NoteInsert = InferInsertModel<typeof import("./schema").notes>;
export type UserInsert = InferInsertModel<typeof import("./schema").users>;
export type AttachmentsInsert = InferInsertModel<
  typeof import("./schema").attachments
>;
