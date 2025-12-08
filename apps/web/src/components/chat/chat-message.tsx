import type { ParsedScribeMessage } from "@scribe/core/ai/service/chat";
import { Sparkles, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
	message: {
		id: string;
		role: "user" | "assistant";
		rawContent: string;
		parsed?: ParsedScribeMessage;
	};
	onRestore?: (code: string) => void;
}

export function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.role === "user";

	return (
		<div
			className={cn(
				"group flex w-full gap-4 p-4",
				isUser ? "flex-row-reverse" : "flex-row",
			)}
		>
			<Avatar className="h-8 w-8 border">
				{isUser ? (
					<>
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>
							<User className="h-4 w-4" />
						</AvatarFallback>
					</>
				) : (
					<AvatarFallback className="bg-primary text-primary-foreground">
						<Sparkles className="h-4 w-4" />
					</AvatarFallback>
				)}
			</Avatar>
			<div className="flex max-w-[80%] flex-col gap-1">
				<div
					className={cn(
						"flex flex-col gap-2 rounded-lg px-4 py-3 text-sm",
						isUser
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground",
					)}
				>
					<div className="whitespace-pre-wrap">
						{message?.parsed?.reply || message?.rawContent}
					</div>
				</div>
			</div>
		</div>
	);
}
