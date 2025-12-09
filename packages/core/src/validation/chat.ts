import * as z from "zod";
import { EMAIL_PRESETS, EMAIL_TONES } from "../constants";

export const createChatSchema = z.object({
	prompt: z.string().min(1, "initial prompt is required"),
	brandId: z.uuid().nullish(),
	emailTone: z.enum(EMAIL_TONES).default("friendly"),
	emailPreset: z.enum(EMAIL_PRESETS).default("welcome_series"),
});

export const getRecentChatsSchema = z.object({
	limit: z.number().int().default(10),
	offset: z.number().int().default(0),
});

export const chatSchema = createChatSchema.omit({ prompt: true }).extend({
	chatId: z.uuid(),
});
