import {
	fetchServerSentEvents,
	type UIMessage,
	useChat,
} from "@tanstack/ai-react";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { useScribeChat } from "@/hooks/chat";
import { DashboardChatInput } from "./dashboard-chat-input";

interface DashboardChatPanelProps {
	isLoading: boolean;
	chatId: string;
	setGeneratedCode: (code: string) => void;
	input: string;
	setInput: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	selectedBrandId: string | null;
	setSelectedBrandId: Dispatch<SetStateAction<string | null>>;
	tone: string;
	setTone: (value: string) => void;
	emailPreset: string;
	setEmailPreset: (value: string) => void;
}

export function DashboardChatPanel({
	isLoading,
	chatId,
	setGeneratedCode,
	input,
	setInput,
	onKeyDown,
	selectedBrandId,
	setSelectedBrandId,
	tone,
	setTone,
	emailPreset,
	setEmailPreset,
}: DashboardChatPanelProps) {
	const { chatMessages, isFetchingChatMessages } = useScribeChat(chatId);

	const { messages, setMessages, sendMessage } = useChat({
		connection: fetchServerSentEvents("/api/chat", {
			body: {
				chatId,
			},
		}),
	});

	useEffect(() => {
		if (chatMessages?.length && !isFetchingChatMessages) {
			if (chatMessages.length === 1) {
				sendMessage(chatMessages[0].message);
			} else {
				setMessages(
					chatMessages.map(
						(msg): UIMessage => ({
							id: msg.id,
							parts: [{ type: "text", content: msg.message }],
							role: msg.role === "user" ? "user" : "assistant",
						}),
					),
				);
			}
		}
	}, [isFetchingChatMessages]);

	return (
		<div className="flex h-full flex-col">
			<ChatList
				messages={messages}
				isLoading={isLoading}
				onRestoreVersion={setGeneratedCode}
			/>
			<DashboardChatInput
				input={input}
				setInput={setInput}
				onKeyDown={onKeyDown}
				selectedBrandId={selectedBrandId}
				setSelectedBrandId={setSelectedBrandId}
				tone={tone}
				setTone={setTone}
				emailPreset={emailPreset}
				setEmailPreset={setEmailPreset}
				sendMessage={sendMessage}
			/>
		</div>
	);
}
