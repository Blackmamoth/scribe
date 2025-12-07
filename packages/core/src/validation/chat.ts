import * as z from "zod";

export const createChatSchema = z.object({
	prompt: z.string().min(1, "initial prompt is required"),
});

export const chatSchema = z.object({
	chatId: z.uuid(),
	// messages: z.array(z.instanceof()),
	brandId: z.uuid().nullish(),
});
