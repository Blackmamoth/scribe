import type { DiffHunk, ParsedDiff } from "./diff-parser";

export interface ChangeInfo {
	/** Start position in the ORIGINAL code */
	originalStart: number;
	/** End position in the ORIGINAL code */
	originalEnd: number;
	/** The text that was replaced */
	oldText: string;
	/** The new text that was inserted */
	newText: string;
}

export interface ApplyResult {
	/** Whether all hunks were applied successfully */
	success: boolean;
	/** The resulting code after applying patches */
	code: string;
	/** Number of hunks that were successfully applied */
	appliedHunks: number;
	/** Hunks that failed to apply */
	failedHunks: DiffHunk[];
	/** Error messages for failed hunks */
	errors: string[];
	/** Detailed info about each change that was applied */
	changes: ChangeInfo[];
}

function normalizeForMatch(str: string): string {
	return str.trim().replace(/\s+/g, " ");
}

function findTarget(
	code: string,
	target: string,
	fuzzy = true,
): { start: number; end: number; matched: string } | null {
	// Try exact match first
	const exactIndex = code.indexOf(target);
	if (exactIndex !== -1) {
		return {
			start: exactIndex,
			end: exactIndex + target.length,
			matched: target,
		};
	}

	if (!fuzzy) {
		return null;
	}

	// Try fuzzy matching: normalize spaces and try again
	const normalizedTarget = normalizeForMatch(target);
	const lines = code.split("\n");

	// Try to find a line-by-line match with normalized comparison
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;
		const normalizedLine = normalizeForMatch(line);

		// Single line match
		if (normalizedLine === normalizedTarget) {
			const lineStart = lines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
			const lineEnd = lineStart + line.length;
			return {
				start: lineStart,
				end: lineEnd,
				matched: line,
			};
		}

		// Multi-line match: try matching target lines starting from this position
		const targetLines = target.split("\n");
		if (targetLines.length > 1 && i + targetLines.length <= lines.length) {
			let allMatch = true;
			for (let j = 0; j < targetLines.length; j++) {
				const codeLine = lines[i + j];
				const targetLine = targetLines[j];
				if (
					codeLine === undefined ||
					targetLine === undefined ||
					normalizeForMatch(codeLine) !== normalizeForMatch(targetLine)
				) {
					allMatch = false;
					break;
				}
			}

			if (allMatch) {
				const blockStart =
					lines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
				const matchedLines = lines.slice(i, i + targetLines.length).join("\n");
				return {
					start: blockStart,
					end: blockStart + matchedLines.length,
					matched: matchedLines,
				};
			}
		}
	}

	// Try substring match with trimmed target as last resort
	const trimmedTarget = target.trim();
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;
		const trimmedLine = line.trim();
		if (trimmedLine === trimmedTarget) {
			const lineStart = lines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
			return {
				start: lineStart,
				end: lineStart + line.length,
				matched: line,
			};
		}
	}

	return null;
}

export function applyDiff(originalCode: string, diff: ParsedDiff): ApplyResult {
	if (!diff.isValid) {
		return {
			success: false,
			code: originalCode,
			appliedHunks: 0,
			failedHunks: diff.hunks,
			errors: diff.errors,
			changes: [],
		};
	}

	let code = originalCode;
	const failedHunks: DiffHunk[] = [];
	const errors: string[] = [];
	const changes: ChangeInfo[] = [];
	let appliedCount = 0;
	// Track offset as we apply changes (positions shift after each replacement)
	let offset = 0;

	for (const hunk of diff.hunks) {
		// Find in original code (so positions are relative to original)
		const found = findTarget(originalCode, hunk.target, true);

		if (found) {
			// Record the change info (in original code coordinates)
			changes.push({
				originalStart: found.start,
				originalEnd: found.end,
				oldText: found.matched,
				newText: hunk.replacement,
			});

			// Apply to the working code (accounting for previous changes)
			const adjustedStart = found.start + offset;
			const adjustedEnd = found.end + offset;
			code =
				code.slice(0, adjustedStart) +
				hunk.replacement +
				code.slice(adjustedEnd);

			// Update offset for next iteration
			offset += hunk.replacement.length - found.matched.length;
			appliedCount++;
		} else {
			failedHunks.push(hunk);
			errors.push(
				`Could not find target in code: "${hunk.target.slice(0, 50)}${hunk.target.length > 50 ? "..." : ""}"`,
			);
		}
	}

	return {
		success: failedHunks.length === 0,
		code,
		appliedHunks: appliedCount,
		failedHunks,
		errors,
		changes,
	};
}

export function formatApplyError(result: ApplyResult): string {
	if (result.success) {
		return "";
	}

	const lines = ["Failed to apply some code changes:"];

	for (const error of result.errors) {
		lines.push(`  • ${error}`);
	}

	if (result.appliedHunks > 0) {
		lines.push(`\n${result.appliedHunks} change(s) were applied successfully.`);
	}

	lines.push("\nThe code may be outdated. Please try regenerating the email.");

	return lines.join("\n");
}
