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
	currentVersion: number | null;
	onOpenDialog: (versionId: string, version: number) => void;
	disabled?: boolean;
}

export function VersionSelector({
	versions,
	currentVersion,
	onOpenDialog,
	disabled = false,
}: VersionSelectorProps) {
	if (versions.length === 0) {
		return null;
	}

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
					<span>Version {currentVersion ?? versions[0]?.version}</span>
					<ChevronDown className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				{versions.map((version) => (
					<DropdownMenuItem
						key={version.id}
						onClick={() =>
							version.version !== currentVersion
								? onOpenDialog(version.id, version.version)
								: undefined
						}
						disabled={version.version === currentVersion}
					>
						<div className="flex w-full flex-col gap-0.5">
							<div className="flex items-center justify-between">
								<span className="font-medium">Version {version.version}</span>
								{version.version === currentVersion && (
									<span className="text-muted-foreground text-xs">Current</span>
								)}
							</div>
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
