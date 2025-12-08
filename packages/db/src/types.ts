import type { InferSelectModel } from "drizzle-orm";
import type { chatMessage } from "./schema";
import type { brand } from "./schema/brand";

export interface Brand extends InferSelectModel<typeof brand> {}

export interface ChatMessage extends InferSelectModel<typeof chatMessage> {}
