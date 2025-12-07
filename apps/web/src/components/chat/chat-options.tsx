import { Mail, MessageSquare, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatOptionsProps {
	tone: string;
	setTone: (value: string) => void;
	emailPreset: string;
	setEmailPreset: (value: string) => void;
}

export function ChatOptions({
	tone,
	setTone,
	emailPreset,
	setEmailPreset,
}: ChatOptionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted"
				>
					<Settings2 className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-64 p-2" align="start">
				<div className="mb-1 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Composer Options
				</div>
				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5">
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
						<div className="flex flex-1 items-center justify-between gap-2">
							<span className="font-medium text-sm">Tone</span>
							<span className="rounded-full bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
								{tone || "Default"}
							</span>
						</div>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup value={tone} onValueChange={setTone}>
							<DropdownMenuRadioItem value="Professional">
								Professional
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Friendly">
								Friendly
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Playful">
								Playful
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Urgent">
								Urgent
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Empathetic">
								Empathetic
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="mt-1 flex items-center gap-2 px-2 py-1.5">
						<Mail className="h-4 w-4 text-muted-foreground" />
						<div className="flex flex-1 items-center justify-between gap-2">
							<span className="font-medium text-sm">Preset</span>
							<span className="rounded-full bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
								{emailPreset || "None"}
							</span>
						</div>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={emailPreset}
							onValueChange={setEmailPreset}
						>
							<DropdownMenuRadioItem value="Cold Email">
								Cold Email
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Newsletter">
								Newsletter
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Follow-up">
								Follow-up
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Announcement">
								Announcement
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="Welcome Series">
								Welcome Series
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
