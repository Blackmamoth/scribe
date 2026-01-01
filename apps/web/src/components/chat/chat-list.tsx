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
	onRestoreVersion?: (code: string) => void;
	onRollbackFromMessage?: (messageId: string) => void;
	messageVersions?: Map<string, boolean>;
	user?: User;
}

export function ChatList({
	messages,
	onRestoreVersion,
	onRollbackFromMessage,
	messageVersions,
	user,
}: ChatListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint: this effect intentionally scrolls on every message change
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex-1 space-y-4 overflow-y-auto p-4">
			{messages.map((message) => (
				<motion.div
					key={message.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<ChatMessage
						message={message}
						onRestore={onRestoreVersion}
						onRollback={
							message.role === "user" && onRollbackFromMessage
								? () => onRollbackFromMessage(message.id)
								: undefined
						}
						showRollbackButton={
							message.role === "user" &&
							messageVersions?.get(message.id) === true
						}
						user={user}
					/>
				</motion.div>
			))}
			<div ref={bottomRef} />
		</div>
	);
}
