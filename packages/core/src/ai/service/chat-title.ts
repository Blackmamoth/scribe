import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import {
	buildChatTitleUserPrompt,
	CHAT_TITLE_SYSTEM_PROMPT,
} from "../prompt/chat-title";

export const generateChatTitle = async (message: string) => {
	const prompt = buildChatTitleUserPrompt(message);

	try {
		const { text } = await generateText({
			model: openai("gpt-4o-mini"),
			system: CHAT_TITLE_SYSTEM_PROMPT,
			prompt: buildChatTitleUserPrompt(prompt),
		});

		return text;
	} catch (error) {
		console.error(error);
		return "New Chat";
	}
};
