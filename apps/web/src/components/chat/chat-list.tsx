import type { ParsedScribeMessage } from "@scribe/core/ai/service/chat";
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
	isLoading?: boolean;
	onRestoreVersion?: (code: string) => void;
}

export function ChatList({
	messages,
	isLoading,
	onRestoreVersion,
}: ChatListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

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
					<ChatMessage message={message} onRestore={onRestoreVersion} />
				</motion.div>
			))}
			{isLoading && (
				<div className="flex w-full gap-4 p-4">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<span className="animate-pulse">AI is thinking...</span>
					</div>
				</div>
			)}
			<div ref={bottomRef} />
		</div>
	);
}
