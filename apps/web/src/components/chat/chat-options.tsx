import { EMAIL_PRESETS, EMAIL_TONES } from "@scribe/core/constants";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
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
import { formatUnderscoreString } from "@/lib/utils";

interface ChatOptionsProps {
	tone: EmailTone;
	setTone: (value: EmailTone) => void;
	emailPreset: EmailPreset;
	setEmailPreset: (value: EmailPreset) => void;
}

export function ChatOptions({
	tone,
	setTone,
	emailPreset,
	setEmailPreset,
}: ChatOptionsProps) {
	function isEmailTone(value: string): value is EmailTone {
		return EMAIL_TONES.includes(value as EmailTone);
	}

	function isEmailPreset(value: string): value is EmailPreset {
		return EMAIL_PRESETS.includes(value as EmailPreset);
	}

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
								{formatUnderscoreString(tone) || "Default"}
							</span>
						</div>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={tone}
							onValueChange={(v) => {
								if (isEmailTone(v)) {
									setTone(v);
								}
							}}
						>
							{EMAIL_TONES.map((t) => (
								<DropdownMenuRadioItem key={t} value={t}>
									{formatUnderscoreString(t)}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="mt-1 flex items-center gap-2 px-2 py-1.5">
						<Mail className="h-4 w-4 text-muted-foreground" />
						<div className="flex flex-1 items-center justify-between gap-2">
							<span className="font-medium text-sm">Preset</span>
							<span className="rounded-full bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
								{formatUnderscoreString(emailPreset) || "None"}
							</span>
						</div>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={emailPreset}
							onValueChange={(v) => {
								if (isEmailPreset(v)) {
									setEmailPreset(v);
								}
							}}
						>
							{EMAIL_PRESETS.map((t) => (
								<DropdownMenuRadioItem key={t} value={t}>
									{formatUnderscoreString(t)}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
