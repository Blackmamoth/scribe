import { type UIMessage, useChat } from "@ai-sdk/react";
import { processScribeMessages } from "@scribe/core/ai/service/chat";
import type { ChatMessage, EmailPreset, EmailTone } from "@scribe/db/types";
import { DefaultChatTransport } from "ai";
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { ChatList } from "@/components/chat/chat-list";
import { DashboardChatInput } from "./dashboard-chat-input";

interface DashboardChatPanelProps {
	isLoading: boolean;
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
	chatMessages?: ChatMessage[];
	isFetchingChatMessages: boolean;
}

export function DashboardChatPanel({
	isLoading,
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
	chatMessages,
	isFetchingChatMessages,
}: DashboardChatPanelProps) {
	const initializedRef = useRef(false);
	const { messages, setMessages, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: {
				chatId,
				brandId: selectedBrandId,
				emailTone: tone,
				emailPreset: emailPreset,
			},
		}),
		id: chatId,
	});

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

	useEffect(() => {
		if (
			chatMessages?.length &&
			!isFetchingChatMessages &&
			!initializedRef.current
		) {
			initializedRef.current = true;
			if (chatMessages.length === 1) {
				sendMessage(
					{ text: chatMessages[0].message },
					{
						body: {
							chatId,
							brandId: selectedBrandId,
							emailTone: tone,
							emailPreset: emailPreset,
						},
					},
				);
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
