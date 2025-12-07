import { chat, type UIMessage } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";
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
	const response = chat({
		adapter: openai(),
		messages: messages,
		model: "gpt-4o-mini",
		systemPrompts: [
			buildScribeUserPrompt({
				preset: "Announcement",
				tone: "Professional",
				brand,
			}),
		],
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

	const assistant = extract("assistant");
	const code = extract("code");

	return { assistant, code };
}

export type ScribeStreamState = {
	assistant: string;
	code: string;
	mode: "idle" | "assistant" | "code";
	buffer: string; // holds partial chunk data
	done: boolean;
};

export function createScribeParser() {
	const state: ScribeStreamState = {
		assistant: "",
		code: "",
		mode: "idle",
		buffer: "",
		done: false,
	};

	const find = (buf: string, tag: string) => buf.indexOf(tag);

	function processChunk(rawChunk: string) {
		if (state.done) return state;

		state.buffer += rawChunk;

		while (true) {
			// Idle → look for <assistant>
			if (state.mode === "idle") {
				const startAssistant = find(state.buffer, "<assistant>");
				if (startAssistant !== -1) {
					state.buffer = state.buffer.slice(
						startAssistant + "<assistant>".length,
					);
					state.mode = "assistant";
					continue;
				}
			}

			// Inside assistant block
			if (state.mode === "assistant") {
				const endAssistant = find(state.buffer, "</assistant>");
				if (endAssistant !== -1) {
					state.assistant += state.buffer.slice(0, endAssistant);
					state.buffer = state.buffer.slice(
						endAssistant + "</assistant>".length,
					);
					state.mode = "idle";
					continue;
				}
				state.assistant += state.buffer;
				state.buffer = "";
				break;
			}

			// Idle → look for <code>
			if (state.mode === "idle") {
				const startCode = find(state.buffer, "<code>");
				if (startCode !== -1) {
					state.buffer = state.buffer.slice(startCode + "<code>".length);
					state.mode = "code";
					continue;
				}
			}

			// Inside code block
			if (state.mode === "code") {
				const endCode = find(state.buffer, "</code>");
				if (endCode !== -1) {
					state.code += state.buffer.slice(0, endCode);
					state.buffer = state.buffer.slice(endCode + "</code>".length);
					state.mode = "idle";
					state.done = true;
					break;
				}
				state.code += state.buffer;
				state.buffer = "";
				break;
			}

			break;
		}

		return state;
	}

	return {
		processChunk,
		getState: () => state,
	};
}
