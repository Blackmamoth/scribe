import type { UIMessage } from "@ai-sdk/react";
import { processScribeMessages } from "@scribe/core/ai/service/chat";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { Square } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { Button } from "@/components/ui/button";
import { DashboardChatInput } from "./dashboard-chat-input";

interface DashboardChatPanelProps {
	chatId: string;
	setGeneratedCode: (code: string) => void;
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
	user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

export function DashboardChatPanel({
	chatId,
	setGeneratedCode,
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

	// Update generated code when assistant message is complete
	useEffect(() => {
		// Find the last assistant message
		const lastMessage = displayMessages[displayMessages.length - 1];

		if (lastMessage?.role === "assistant" && lastMessage.parsed) {
			const { code } = lastMessage.parsed;

			if (code) {
				setGeneratedCode(code);
			}
		}
	}, [displayMessages, setGeneratedCode]);

	return (
		<div className="flex h-full flex-col">
			<ChatList
				messages={displayMessages}
				onRestoreVersion={setGeneratedCode}
				user={user}
			/>
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
