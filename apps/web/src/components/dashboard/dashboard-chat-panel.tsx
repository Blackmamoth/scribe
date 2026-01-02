import type { UIMessage } from "@ai-sdk/react";
import { applyDiff, formatApplyError, parseDiff } from "@scribe/core/ai";
import { processScribeMessages } from "@scribe/core/ai/service/chat";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
import type { User } from "better-auth";
import { Square } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { toast } from "sonner";
import { ChatList } from "@/components/chat/chat-list";
import { Button } from "@/components/ui/button";
import { DashboardChatInput } from "./dashboard-chat-input";

interface DashboardChatPanelProps {
	chatId: string;
	generatedCode: string;
	setGeneratedCode: (code: string) => void;
	onCodePatched?: (oldText: string, newText: string) => void;
	input: string;
	setInput: (value: string) => void;
	selectedBrandId: string | null;
	setSelectedBrandId: Dispatch<SetStateAction<string | null>>;
	tone: EmailTone;
	setTone: (value: EmailTone) => void;
	emailPreset: EmailPreset;
	setEmailPreset: (value: EmailPreset) => void;
	messages: UIMessage[];
	sendMessage: (
		message: { text: string },
		chatRequestOptions?: {
			data?: Record<string, string>;
			body?: object;
		},
	) => void;
	status: "submitted" | "streaming" | "error" | "ready";
	stop: () => void;
	user?: User;
}

export function DashboardChatPanel({
	chatId,
	generatedCode,
	setGeneratedCode,
	onCodePatched,
	input,
	setInput,
	selectedBrandId,
	setSelectedBrandId,
	tone,
	setTone,
	emailPreset,
	setEmailPreset,
	messages,
	sendMessage,
	status,
	stop,
	user,
}: DashboardChatPanelProps) {
	// Track which message we've already processed to avoid re-applying
	const lastProcessedMessageIdRef = useRef<string | null>(null);
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey && status !== "streaming") {
			e.preventDefault();
			sendMessage(
				{ text: input },
				{
					body: {
						chatId,
						brandId: selectedBrandId,
						emailTone: tone,
						emailPreset: emailPreset,
					},
				},
			);
			setInput("");
		}
	};

	// Logic to load initial messages is now handled in the parent route component

	const displayMessages = useMemo(() => {
		return processScribeMessages(messages);
	}, [messages]);

	// Update generated code when assistant message changes
	useEffect(() => {
		// Find the last assistant message
		const lastMessage = displayMessages[displayMessages.length - 1];

		if (
			!lastMessage ||
			lastMessage.role !== "assistant" ||
			!lastMessage.parsed
		) {
			return;
		}

		const { code, diff, isDiff, isComplete } = lastMessage.parsed;

		// For diffs: only apply when complete (partial diffs can't be applied)
		if (isDiff) {
			// Skip if we've already processed this message
			if (lastMessage.id === lastProcessedMessageIdRef.current) {
				return;
			}

			if (!isComplete) {
				return;
			}

			if (diff && generatedCode) {
				const parsedDiff = parseDiff(diff);
				const result = applyDiff(generatedCode, parsedDiff);

				if (result.success) {
					// Get the first change for animation
					const firstChange = result.changes[0];
					if (firstChange) {
						onCodePatched?.(firstChange.oldText, firstChange.newText);
					}
					setGeneratedCode(result.code);
					lastProcessedMessageIdRef.current = lastMessage.id;
				} else {
					// Show error to user
					toast.error("Failed to apply code changes", {
						description: formatApplyError(result),
					});
					lastProcessedMessageIdRef.current = lastMessage.id;
				}
			}
		} else if (code) {
			// For full code: update during streaming (show live preview)
			setGeneratedCode(code);
			// Only mark as processed when complete
			if (isComplete) {
				lastProcessedMessageIdRef.current = lastMessage.id;
			}
		}
	}, [displayMessages, generatedCode, setGeneratedCode, onCodePatched]);

	return (
		<div className="flex h-full flex-col">
			<ChatList messages={displayMessages} user={user} />
			<div className="relative">
				<DashboardChatInput
					input={input}
					setInput={setInput}
					onKeyDown={handleKeyDown}
					selectedBrandId={selectedBrandId}
					setSelectedBrandId={setSelectedBrandId}
					tone={tone}
					setTone={setTone}
					emailPreset={emailPreset}
					setEmailPreset={setEmailPreset}
					disabled={status === "streaming"}
				/>
				{status === "streaming" && (
					<div className="absolute right-6 bottom-6">
						<Button
							variant="destructive"
							size="icon-sm"
							onClick={stop}
							className="shadow-lg"
						>
							<Square className="h-3 w-3" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
