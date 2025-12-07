import { useNavigate } from "@tanstack/react-router";
import { Check, Plus, X } from "lucide-react";
import type { SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrand } from "@/hooks/brand";
import { cn } from "@/lib/utils";

interface BrandSelectorProps {
	value?: string | null;
	onChange: React.Dispatch<SetStateAction<string | null>>;
	className?: string;
}

export function BrandSelector({
	value,
	onChange,
	className,
}: BrandSelectorProps) {
	const { brands } = useBrand();

	const navigate = useNavigate();

	const selectedBrand = brands?.find((brand) => brand.id === value);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="start">
					<DropdownMenuLabel>Add to context</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{brands && brands.length > 0 && (
							<>
								<DropdownMenuLabel className="px-2 py-1 font-normal text-muted-foreground text-xs">
									Select Brand
								</DropdownMenuLabel>
								{brands.map((brand) => (
									<DropdownMenuItem
										key={brand.id}
										onClick={() =>
											onChange(brand.id === value ? null : brand.id)
										}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2 truncate">
											{brand.logoUrl ? (
												<img
													src={brand.logoUrl}
													alt={brand.name}
													className="h-4 w-4 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted font-bold text-[8px]">
													{brand.name.substring(0, 2).toUpperCase()}
												</div>
											)}
											<span className="truncate">{brand.name}</span>
										</div>
										{value === brand.id && (
											<Check className="h-4 w-4 opacity-100" />
										)}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem onClick={() => navigate({ to: "/brands" })}>
							<Plus className="mr-2 h-4 w-4" />
							Create Brand
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{selectedBrand && (
				<div className="fade-in zoom-in flex animate-in items-center gap-2 rounded-md border border-border/50 bg-muted/50 px-2 py-1 font-medium text-xs duration-200">
					{selectedBrand.logoUrl ? (
						<img
							src={selectedBrand.logoUrl}
							alt={selectedBrand.name}
							className="h-4 w-4 rounded-full object-cover"
						/>
					) : (
						<div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted font-bold text-[8px]">
							{selectedBrand.name.substring(0, 2).toUpperCase()}
						</div>
					)}
					<span>{selectedBrand.name}</span>
					<button
						type="button"
						onClick={() => onChange(null)}
						className="ml-1 transition-colors hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
		</div>
	);
}
