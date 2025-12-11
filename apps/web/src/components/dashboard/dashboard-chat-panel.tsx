import type { UIMessage } from "@ai-sdk/react";
import { processScribeMessages } from "@scribe/core/ai/service/chat";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { type Dispatch, type SetStateAction, useEffect, useMemo } from "react";
import { ChatList } from "@/components/chat/chat-list";
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
}: DashboardChatPanelProps) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
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
			/>
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
			/>
		</div>
	);
}
