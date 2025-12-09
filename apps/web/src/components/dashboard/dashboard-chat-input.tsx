import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { ArrowRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { BrandSelector } from "@/components/brands/brand-selector";
import { ChatOptions } from "@/components/chat/chat-options";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DashboardChatInputProps {
	input: string;
	setInput: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	selectedBrandId: string | null;
	setSelectedBrandId: Dispatch<SetStateAction<string | null>>;
	tone: EmailTone;
	setTone: (value: EmailTone) => void;
	emailPreset: EmailPreset;
	setEmailPreset: (value: EmailPreset) => void;
}

export function DashboardChatInput({
	input,
	setInput,
	onKeyDown,
	selectedBrandId,
	setSelectedBrandId,
	tone,
	setTone,
	emailPreset,
	setEmailPreset,
}: DashboardChatInputProps) {
	return (
		<div className="border-t bg-background p-4">
			<div className="relative rounded-xl border bg-background p-2 shadow-sm ring-1 ring-border transition-all focus-within:ring-2 focus-within:ring-primary/30">
				<Textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder="Describe the email you want to build..."
					className="min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0"
				/>
				<div className="mt-2 flex items-center justify-between px-3 pb-3">
					<div className="flex items-center gap-2">
						<BrandSelector
							value={selectedBrandId}
							onChange={setSelectedBrandId}
						/>
						<ChatOptions
							tone={tone}
							setTone={setTone}
							emailPreset={emailPreset}
							setEmailPreset={setEmailPreset}
						/>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden text-muted-foreground text-xs sm:block">
							Press{" "}
							<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
								Enter
							</kbd>{" "}
							to send
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
