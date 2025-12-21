import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { buildScribeUserPrompt } from "../prompt";

export const handleChat = (
	messages: UIMessage[],
	preset?: string,
	tone?: string,
	brand?: {
		name?: string;
		logoUrl?: string;
		tagline?: string;
		websiteUrl?: string;
		primaryColor?: string;
		secondaryColor?: string;
	},
) => {
	const response = streamText({
		model: openai("gpt-4o-mini"),
		messages: convertToModelMessages(messages),
		system: buildScribeUserPrompt({
			preset: preset ?? "announcement",
			tone: tone ?? "professional",
			brand,
		}),
	});

	return response;
};

export interface ParsedScribeResponse {
	assistant: string;
	code: string;
	diff: string;
	isDiff: boolean;
}

export function parseScribeResponse(fullText: string): ParsedScribeResponse {
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
	const diff = extract("scribe-diff");

	// If we have a diff but no code, this is a diff response
	const isDiff = !!diff && !code;

	return { assistant, code, diff, isDiff };
}

export interface ParsedScribeMessage {
	reply: string;
	code: string;
	diff: string;
	isDiff: boolean;
	isComplete: boolean;
}

export function parseScribeStream(content: string): ParsedScribeMessage {
	let reply = "";
	let code = "";
	let diff = "";
	let isComplete = false;

	const replyStartMatch = content.match(/<scribe-reply>/);
	if (replyStartMatch?.index !== undefined) {
		const replyStart = replyStartMatch.index + "<scribe-reply>".length;
		const replyEndMatch = content.match(/<\/scribe-reply>/);

		if (replyEndMatch) {
			reply = content.substring(replyStart, replyEndMatch.index).trim();
		} else {
			const codeStartMatch = content.match(/<scribe-code>/);
			const diffStartMatch = content.match(/<scribe-diff>/);
			const codeIndex = codeStartMatch?.index ?? content.length;
			const diffIndex = diffStartMatch?.index ?? content.length;
			const extractUntil = Math.min(codeIndex, diffIndex);
			reply = content.substring(replyStart, extractUntil).trim();
		}
	}

	// Try to extract code
	const codeStartMatch = content.match(/<scribe-code>/);
	if (codeStartMatch?.index !== undefined) {
		const codeStart = codeStartMatch.index + "<scribe-code>".length;
		const codeEndMatch = content.match(/<\/scribe-code>/);

		if (codeEndMatch) {
			code = content.substring(codeStart, codeEndMatch.index).trim();
			isComplete = true;
		} else {
			code = content.substring(codeStart).trim();
		}
	}

	// Try to extract diff
	const diffStartMatch = content.match(/<scribe-diff>/);
	if (diffStartMatch?.index !== undefined) {
		const diffStart = diffStartMatch.index + "<scribe-diff>".length;
		const diffEndMatch = content.match(/<\/scribe-diff>/);

		if (diffEndMatch) {
			diff = content.substring(diffStart, diffEndMatch.index).trim();
			isComplete = true;
		} else {
			diff = content.substring(diffStart).trim();
		}
	}

	const isDiff = !!diff && !code;

	return {
		reply,
		code,
		diff,
		isDiff,
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
