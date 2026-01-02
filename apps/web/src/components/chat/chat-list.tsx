import type { ParsedScribeMessage } from "@scribe/core/ai/service/chat";
import type { User } from "better-auth";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";

interface ChatListProps {
	messages: {
		id: string;
		role: "user" | "assistant";
		rawContent: string;
		parsed?: ParsedScribeMessage;
	}[];
	user?: User;
	onRollback?: (messageId: string) => void;
	selectedChatMessageId: string | null;
}

export function ChatList({
	messages,
	user,
	onRollback,
	selectedChatMessageId,
}: ChatListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	// biome-ignore lint: this effect intentionally scrolls on every message change
	useEffect(() => {
		if (!selectedChatMessageId) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, selectedChatMessageId]);

	useEffect(() => {
		if (selectedChatMessageId) {
			const element = messageRefs.current.get(selectedChatMessageId);
			element?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [selectedChatMessageId]);

	return (
		<div className="flex-1 space-y-4 overflow-y-auto p-4">
			{messages.map((message) => (
				<motion.div
					key={message.id}
					ref={(el) => {
						if (el) {
							messageRefs.current.set(message.id, el);
						}
					}}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<ChatMessage message={message} user={user} onRollback={onRollback} />
				</motion.div>
			))}
			<div ref={bottomRef} />
		</div>
	);
}
