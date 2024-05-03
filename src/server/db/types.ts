import type { InferSelectModel } from "drizzle-orm";

export type File = InferSelectModel<typeof import("./schema").files>;
export type Note = InferSelectModel<typeof import("./schema").notes>;
export type User = InferSelectModel<typeof import("./schema").users>;
export type Attachments = InferSelectModel<
  typeof import("./schema").attachments
>;
