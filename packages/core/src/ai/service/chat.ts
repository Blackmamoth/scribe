import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { buildScribeUserPrompt } from "../prompt";

export const handleChat = (
	messages: UIMessage[],
	brand?: {
		name?: string;
		logoUrl?: string;
		tagline?: string;
		websiteUrl?: string;
	},
) => {
	const response = streamText({
		model: openai("gpt-4o-mini"),
		messages: convertToModelMessages(messages),
		system: buildScribeUserPrompt({
			preset: "Announcement",
			tone: "Professional",
			brand,
		}),
	});

	return response;
};

export function parseScribeResponse(fullText: string) {
	if (!fullText) {
		throw new Error("Invalid response: empty or not a string");
	}

	const text = fullText.trim();

	function extract(tag: string) {
		const open = `<${tag}>`;
		const close = `</${tag}>`;

		const start = text.indexOf(open);
		const end = text.indexOf(close);

		if (start === -1 || end === -1) {
			return "";
		}

		return text.slice(start + open.length, end).trim();
	}

	const assistant = extract("scribe-reply");
	const code = extract("scribe-code");

	return { assistant, code };
}

export interface ParsedScribeMessage {
	reply: string;
	code: string;
	isComplete: boolean;
}

export function parseScribeStream(content: string): ParsedScribeMessage {
	let reply = "";
	let code = "";
	let isComplete = false;

	const replyStartMatch = content.match(/<scribe-reply>/);
	if (replyStartMatch?.index) {
		const replyStart = replyStartMatch.index + "<scribe-reply>".length;
		const replyEndMatch = content.match(/<\/scribe-reply>/);

		if (replyEndMatch) {
			reply = content.substring(replyStart, replyEndMatch.index).trim();
		} else {
			const codeStartMatch = content.match(/<scribe-code>/);
			const extractUntil = codeStartMatch?.index
				? codeStartMatch.index
				: content.length;
			reply = content.substring(replyStart, extractUntil).trim();
		}
	}

	const codeStartMatch = content.match(/<scribe-code>/);
	if (codeStartMatch?.index) {
		const codeStart = codeStartMatch.index + "<scribe-code>".length;
		const codeEndMatch = content.match(/<\/scribe-code>/);

		if (codeEndMatch) {
			code = content.substring(codeStart, codeEndMatch.index).trim();
			isComplete = true;
		} else {
			code = content.substring(codeStart).trim();
		}
	}

	return {
		reply,
		code,
		isComplete,
	};
}

export function processScribeMessages(messages: UIMessage[]): {
	id: string;
	role: "user" | "assistant";
	rawContent: string;
	parsed?: ParsedScribeMessage;
}[] {
	return messages.map((message) => {
		const rawContent = message.parts
			.map((part) => (part.type === "text" ? part.text : ""))
			.join("")
			.trim();

		if (message.role === "assistant") {
			const parsed = parseScribeStream(rawContent);
			return {
				id: message.id,
				role: message.role,
				rawContent,
				parsed,
			};
		}

		return {
			id: message.id,
			role: message.role as "user",
			rawContent,
		};
	});
}
