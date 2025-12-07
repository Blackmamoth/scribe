import type { UIMessage } from "@tanstack/ai-react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";

interface ChatListProps {
	messages: UIMessage[];
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
	}, []);

	return (
		<div className="flex-1 space-y-4 overflow-y-auto p-4">
			{messages.map((message) => (
				<ChatMessage
					key={message.id}
					message={message}
					onRestore={onRestoreVersion}
				/>
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
