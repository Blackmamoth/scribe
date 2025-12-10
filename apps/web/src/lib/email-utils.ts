/**
 * Mocks sending a test email with the provided HTML content.
 * @param html The HTML content of the email.
 * @param to The email address to send to.
 */
export async function sendTestEmail(html: string, to: string): Promise<void> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	// Log for debugging/verification
	console.log(`[MOCK EMAIL SEND] To: ${to}`);
	console.log(`[MOCK EMAIL CONTENT LENGTH]: ${html.length} chars`);

	// In a real implementation, this would POST to an API
	// await fetch('/api/email/send-test', { method: 'POST', body: JSON.stringify({ html, to }) });
}
