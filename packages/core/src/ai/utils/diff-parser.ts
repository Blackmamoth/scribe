/**
 * Diff Parser Utility
 *
 * Parses a custom diff format designed for LLM-generated code patches.
 *
 * Format:
 * @@
 * --- {line(s) to find}
 * +++ {replacement line(s)}
 * @@
 *
 * Multiple hunks can exist in sequence.
 */

export interface DiffHunk {
	/** The exact content to find in the original code */
	target: string;
	/** The content to replace the target with */
	replacement: string;
	/** Raw lines from the diff for debugging */
	rawTarget: string[];
	rawReplacement: string[];
}

export interface ParsedDiff {
	/** Array of parsed hunks */
	hunks: DiffHunk[];
	/** Whether the diff was successfully parsed */
	isValid: boolean;
	/** Any parsing errors encountered */
	errors: string[];
}

/**
 * Parse a custom diff format string into structured hunks
 *
 * @param diffContent - The content between <scribe-diff> tags
 * @returns Parsed diff structure with hunks
 */
export function parseDiff(diffContent: string): ParsedDiff {
	const errors: string[] = [];
	const hunks: DiffHunk[] = [];

	if (!diffContent || typeof diffContent !== "string") {
		return {
			hunks: [],
			isValid: false,
			errors: ["Invalid diff content: empty or not a string"],
		};
	}

	const content = diffContent.trim();

	// Split by @@ markers to get individual hunks
	// Each hunk is wrapped: @@ ... @@
	const hunkPattern = /@@\s*\n([\s\S]*?)(?=\n@@|$)/g;
	const matches = content.matchAll(hunkPattern);

	let matchCount = 0;
	for (const match of matches) {
		matchCount++;
		const hunkContent = match[1];

		if (!hunkContent) {
			continue;
		}

		const trimmedHunkContent = hunkContent.trim();

		const lines = trimmedHunkContent.split("\n");
		const targetLines: string[] = [];
		const replacementLines: string[] = [];

		for (const line of lines) {
			// Accept both --- and - prefix for target lines
			// Also accept both +++ and + prefix for replacement lines
			if (line.startsWith("---")) {
				// Remove the --- prefix and the space after it
				const content = line.slice(3).trimStart();
				targetLines.push(content);
			} else if (line.startsWith("-") && !line.startsWith("--")) {
				// Single - prefix (but not --)
				const content = line.slice(1).trimStart();
				targetLines.push(content);
			} else if (line.startsWith("+++")) {
				// Remove the +++ prefix and the space after it
				const content = line.slice(3).trimStart();
				replacementLines.push(content);
			} else if (line.startsWith("+") && !line.startsWith("++")) {
				// Single + prefix (but not ++)
				const content = line.slice(1).trimStart();
				replacementLines.push(content);
			}
			// Ignore lines that don't start with - or +
		}

		if (targetLines.length === 0) {
			errors.push(`Hunk ${matchCount}: No target lines (---) found`);
			continue;
		}

		// It's valid to have empty replacement (deletion)
		hunks.push({
			target: targetLines.join("\n"),
			replacement: replacementLines.join("\n"),
			rawTarget: targetLines,
			rawReplacement: replacementLines,
		});
	}

	if (hunks.length === 0 && errors.length === 0) {
		errors.push("No valid hunks found in diff content");
	}

	return {
		hunks,
		isValid: hunks.length > 0 && errors.length === 0,
		errors,
	};
}

/**
 * Extract diff content from a raw AI response
 * Looks for content between <scribe-diff> tags
 *
 * @param responseText - The full AI response text
 * @returns The diff content or null if not found
 */
export function extractDiffFromResponse(responseText: string): string | null {
	const match = responseText.match(/<scribe-diff>([\s\S]*?)<\/scribe-diff>/);
	return match?.[1]?.trim() ?? null;
}

/**
 * Check if a response contains a diff (vs full code)
 *
 * @param responseText - The full AI response text
 * @returns true if the response contains a diff
 */
export function isDiffResponse(responseText: string): boolean {
	return (
		responseText.includes("<scribe-diff>") &&
		responseText.includes("</scribe-diff>")
	);
}
