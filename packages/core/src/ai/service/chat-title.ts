import { chat } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";
import {
	buildChatTitleUserPrompt,
	CHAT_TITLE_SYSTEM_PROMPT,
} from "../prompt/chat-title";

export const generateChatTitle = async (message: string) => {
	const prompt = buildChatTitleUserPrompt(message);

	try {
		const stream = chat({
			adapter: openai(),
			messages: [{ role: "user", content: prompt }],
			model: "gpt-4o-mini",
			systemPrompts: [CHAT_TITLE_SYSTEM_PROMPT],
		});

		let title = "";

		for await (const chunk of stream) {
			if (chunk.type === "content") {
				title += chunk.delta;
			}
		}

		return title;
	} catch (error) {
		console.error(error);
		return "";
	}
};
