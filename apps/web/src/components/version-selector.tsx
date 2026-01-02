import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmailVersion } from "@/hooks/use-email-versions";

interface VersionSelectorProps {
	versions: EmailVersion[];
	selectedVersionId: string | null;
	onSelectVersion: (versionId: string | null) => void;
	disabled?: boolean;
}

export function VersionSelector({
	versions,
	selectedVersionId,
	onSelectVersion,
	disabled = false,
}: VersionSelectorProps) {
	if (versions.length === 0) {
		return null;
	}

	const selectedVersion = selectedVersionId
		? versions.find((v) => v.id === selectedVersionId)
		: null;

	const displayText = selectedVersionId
		? `Version ${selectedVersion?.version}`
		: "latest";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={disabled}
				>
					<Clock className="h-4 w-4" />
					<span>{displayText}</span>
					<ChevronDown className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				<DropdownMenuItem
					onClick={() => onSelectVersion(null)}
					disabled={selectedVersionId === null}
				>
					<span className="font-medium">Latest</span>
				</DropdownMenuItem>
				{versions.map((version) => (
					<DropdownMenuItem
						key={version.id}
						onClick={() => onSelectVersion(version.id)}
						disabled={version.id === selectedVersionId}
					>
						<div className="flex w-full flex-col gap-0.5">
							<span className="font-medium">Version {version.version}</span>
							<span className="text-muted-foreground text-xs">
								{formatDistanceToNow(new Date(version.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
