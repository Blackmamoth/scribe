import type { ParsedScribeMessage } from "@scribe/core/ai/service/chat";
import type { User } from "better-auth";
import { RotateCcw, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { RollbackDialog } from "@/components/rollback-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
	message: {
		id: string;
		role: "user" | "assistant";
		rawContent: string;
		parsed?: ParsedScribeMessage;
	};
	user: User;
	onRollback: (messageId: string) => void;
}

export function ChatMessage({ message, user, onRollback }: ChatMessageProps) {
	const isUser = message.role === "user";
	const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join("")
			.slice(0, 2);
	};

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
						<AvatarImage src={user?.image || undefined} />
						<AvatarFallback>
							{user?.name ? (
								getInitials(user.name)
							) : (
								<UserIcon className="h-4 w-4" />
							)}
						</AvatarFallback>
					</>
				) : (
					<AvatarFallback className="bg-primary text-primary-foreground">
						<Sparkles className="h-4 w-4" />
					</AvatarFallback>
				)}
			</Avatar>
			<div className="relative flex max-w-[80%] flex-col gap-1">
				{!isUser && (
					<>
						<Button
							variant="ghost"
							size="icon-sm"
							className="-top-3 absolute right-2 h-7 w-7 bg-muted opacity-0 transition-opacity group-hover:opacity-100"
							onClick={() => setRollbackDialogOpen(true)}
						>
							<RotateCcw className="h-3.5 w-3.5" />
						</Button>
						<RollbackDialog
							open={rollbackDialogOpen}
							onOpenChange={setRollbackDialogOpen}
							onConfirm={() => {
								onRollback(message.id);
								setRollbackDialogOpen(false);
							}}
						/>
					</>
				)}
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
