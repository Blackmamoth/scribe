export const CHAT_TITLE_SYSTEM_PROMPT = `You generate short, polished email-style subject lines based on the user's first message.

Given the user's message, create a concise subject line (4–9 words) that clearly communicates the core purpose or topic.

Rules:
- Capture the main intent or actionable theme of the message.
- Use professional email subject tone (clear, direct, value-focused).
- No trailing punctuation.
- Use Title Case for major words.
- Do not include filler words like "please", "help", "question", "request", etc.
- If the message is vague, choose the closest reasonable subject focus.
- Avoid sounding like a chat title; prioritize clarity and communication value.

Return only the subject line text, nothing else.
`;

export function buildChatTitleUserPrompt(userMessage: string) {
	return `
The user started a new chat with this message:

${userMessage}

Generate a short, clear title that best represents the topic.
  `.trim();
}
