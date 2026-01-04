import {
	Code2,
	Copy,
	Download,
	Eye,
	Monitor,
	Moon,
	Send,
	Smartphone,
	Sun,
	Tablet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionSelector } from "@/components/version-selector";
import type { EmailVersion } from "@/hooks/use-email-versions";
import { cn } from "@/lib/utils";

interface PreviewHeaderProps {
	viewMode: "preview" | "code";
	setViewMode: (mode: "preview" | "code") => void;
	device: "desktop" | "tablet" | "mobile";
	setDevice: (device: "desktop" | "tablet" | "mobile") => void;
	onCopyHtml: () => void;
	onExportJsx: () => void;
	onExportHtml: () => void;
	onSendTest: () => void;
	previewTheme: "light" | "dark";
	setPreviewTheme: (theme: "light" | "dark") => void;
	versions: EmailVersion[];
	selectedVersionId: string | null;
	onSelectVersion: (versionId: string | null) => void;
}

export function PreviewHeader({
	viewMode,
	setViewMode,
	device,
	setDevice,
	onCopyHtml,
	onExportJsx,
	onExportHtml,
	onSendTest,
	previewTheme,
	setPreviewTheme,
	versions,
	selectedVersionId,
	onSelectVersion,
}: PreviewHeaderProps) {
	const handleCopy = () => {
		onCopyHtml();
		toast.success("Code copied to clipboard!");
	};
	return (
		<div className="flex items-center justify-between border-b bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center gap-2">
				<VersionSelector
					versions={versions}
					selectedVersionId={selectedVersionId}
					onSelectVersion={onSelectVersion}
				/>
				<div className="flex items-center rounded-lg border bg-muted/50 p-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-7 w-7",
										device === "desktop" && "bg-background shadow-sm",
									)}
									onClick={() => setDevice("desktop")}
								>
									<Monitor className="h-4 w-4" />
									<span className="sr-only">Desktop</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Desktop</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-7 w-7",
										device === "tablet" && "bg-background shadow-sm",
									)}
									onClick={() => setDevice("tablet")}
								>
									<Tablet className="h-4 w-4" />
									<span className="sr-only">Tablet</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Tablet</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-7 w-7",
										device === "mobile" && "bg-background shadow-sm",
									)}
									onClick={() => setDevice("mobile")}
								>
									<Smartphone className="h-4 w-4" />
									<span className="sr-only">Mobile</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Mobile</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() =>
									setPreviewTheme(previewTheme === "dark" ? "light" : "dark")
								}
							>
								{previewTheme === "dark" ? (
									<Moon className="h-4 w-4" />
								) : (
									<Sun className="h-4 w-4" />
								)}
								<span className="sr-only">Toggle preview theme</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							Preview {previewTheme === "dark" ? "Light" : "Dark"} Mode
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="flex items-center rounded-lg border bg-muted/50 p-1">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-xs",
							viewMode === "preview" && "bg-background shadow-sm",
						)}
						onClick={() => setViewMode("preview")}
					>
						<Eye className="mr-1.5 h-3.5 w-3.5" />
						Preview
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-xs",
							viewMode === "code" && "bg-background shadow-sm",
						)}
						onClick={() => setViewMode("code")}
					>
						<Code2 className="mr-1.5 h-3.5 w-3.5" />
						Code
					</Button>
				</div>

				<div className="mx-1 h-4 w-px bg-border" />

				<Button
					variant="outline"
					size="sm"
					className="h-8 text-xs"
					onClick={handleCopy}
				>
					<Copy className="mr-1.5 h-3.5 w-3.5" />
					Copy
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="h-8 text-xs">
							<Download className="mr-1.5 h-3.5 w-3.5" />
							Export
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onExportHtml}>
							<Code2 className="mr-2 h-4 w-4" />
							Export HTML
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onExportJsx}>
							<Download className="mr-2 h-4 w-4" />
							Export React
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Button size="sm" className="h-8 text-xs" onClick={onSendTest}>
					<Send className="mr-1.5 h-3.5 w-3.5" />
					Send Test
				</Button>
			</div>
		</div>
	);
}
