export const CHAT_TITLE_SYSTEM_PROMPT = `You generate short, clear titles for new chat sessions.

Given the user's first message, create a concise and descriptive title (2–6 words).
Rules:
- Capture the main intent or topic of the message.
- Do not use quotes or punctuation at the ends.
- Use title case (Capitalize Major Words).
- Avoid filler words like "please", "help", "question", etc.
- If the message is unclear, choose the closest reasonable topic.

Return only the title text, nothing else.
`;

export function buildChatTitleUserPrompt(userMessage: string) {
	return `
The user started a new chat with this message:

${userMessage}

Generate a short, clear title that best represents the topic.
  `.trim();
}
