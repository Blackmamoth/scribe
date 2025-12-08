import * as z from "zod";

export const createChatSchema = z.object({
	prompt: z.string().min(1, "initial prompt is required"),
});

export const chatSchema = z.object({
	chatId: z.uuid(),
	brandId: z.uuid().nullish(),
});

export const saveChatMessageSchema = z.object({
	chatId: z.uuid(),
	userMessage: z.string().min(1, "user message is required"),
	aiResponse: z.string().min(1, "ai response is required"),
});
