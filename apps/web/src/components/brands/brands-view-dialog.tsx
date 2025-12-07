import type { Brand } from "@scribe/db/types";
import { ExternalLink } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface BrandDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	brand: Brand;
}

export function BrandsViewDialog({
	open,
	onOpenChange,
	brand,
}: BrandDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Brand Details</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 py-4">
					{/* Logo Section */}
					<div className="flex flex-col items-center gap-4">
						{brand.logoUrl ? (
							<div className="h-24 w-24 overflow-hidden rounded-lg border bg-muted">
								<img
									src={brand.logoUrl}
									alt={`${brand.name} logo`}
									className="h-full w-full object-cover"
								/>
							</div>
						) : (
							<div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted">
								<span className="font-semibold text-2xl text-muted-foreground">
									{brand.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
					</div>

					{/* Brand Information */}
					<div className="space-y-4">
						<div>
							<Label className="text-muted-foreground text-xs uppercase tracking-wide">
								Name
							</Label>
							<p className="mt-1 font-medium text-base">{brand.name}</p>
						</div>

						{brand.tagline && (
							<div>
								<Label className="text-muted-foreground text-xs uppercase tracking-wide">
									Tagline
								</Label>
								<p className="mt-1 text-base">{brand.tagline}</p>
							</div>
						)}

						{brand.websiteUrl && (
							<div>
								<Label className="text-muted-foreground text-xs uppercase tracking-wide">
									Website
								</Label>
								<a
									href={brand.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-1 flex items-center gap-2 text-base text-primary hover:underline"
								>
									{brand.websiteUrl}
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
