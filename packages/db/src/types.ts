import type { InferSelectModel } from "drizzle-orm";
import type {
	chat,
	chatMessage,
	emailPresetEnum,
	emailToneEnum,
} from "./schema";
import type { brand } from "./schema/brand";

export interface Brand extends InferSelectModel<typeof brand> {}

export interface Chat extends InferSelectModel<typeof chat> {}

export interface ChatMessage extends InferSelectModel<typeof chatMessage> {}

export type EmailTone = (typeof emailToneEnum.enumValues)[number];

export type EmailPreset = (typeof emailPresetEnum.enumValues)[number];
