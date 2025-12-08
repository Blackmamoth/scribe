import { type UIMessage, useChat } from "@ai-sdk/react";
import { processScribeMessages } from "@scribe/core/ai/service/chat";
import { DefaultChatTransport } from "ai";
import { type Dispatch, type SetStateAction, useEffect, useMemo } from "react";
import { ChatList } from "@/components/chat/chat-list";
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
	chatMessages:
		| {
				id: string;
				message: string;
				role: string;
				createdAt: Date;
				chatId: string;
		  }[]
		| undefined;
	isFetchingChatMessages: boolean;
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
	chatMessages,
	isFetchingChatMessages,
}: DashboardChatPanelProps) {
	const { messages, setMessages, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: {
				chatId,
			},
		}),
	});

	useEffect(() => {
		if (chatMessages?.length && !isFetchingChatMessages) {
			if (chatMessages.length === 1) {
				sendMessage({ text: chatMessages[0].message });
			} else {
				setMessages(
					chatMessages.map(
						(msg): UIMessage => ({
							id: msg.id,
							parts: [{ type: "text", text: msg.message }],
							role: msg.role === "user" ? "user" : "assistant",
						}),
					),
				);
			}
		}
	}, [chatMessages, isFetchingChatMessages, sendMessage, setMessages]);

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
