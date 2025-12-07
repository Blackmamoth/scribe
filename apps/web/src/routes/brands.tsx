import type { Brand } from "@scribe/db/types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Eye, Globe, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import z from "zod";
import { BrandDialog } from "@/components/brands/brands-dialog";
import { BrandsViewDialog } from "@/components/brands/brands-view-dialog";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrand } from "@/hooks/brand";

const searchSchema = z.object({
	brandId: z.uuid().optional(),
});

export const Route = createFileRoute("/brands")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/signin" });
		}
		return { user: context.user };
	},
	validateSearch: searchSchema,
});

function RouteComponent() {
	const { brands, isFetching } = useBrand();

	const { brandId } = Route.useSearch();

	const [brandDialogMode, setBrandDialogMode] = useState<"create" | "edit">(
		"create",
	);

	const [isBrandsDialogOpen, setisBrandsDialogOpen] = useState(false);
	const [isBrandsViewDialogOpen, setisBrandsViewDialogOpen] = useState(false);
	const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>(
		undefined,
	);

	const hasRun = useRef(false);

	const handleEdit = useCallback((brand: Brand) => {
		setSelectedBrand(brand);
		setBrandDialogMode("edit");
		setisBrandsDialogOpen(true);
	}, []);

	const handleView = useCallback((brand: Brand) => {
		setSelectedBrand(brand);
		setisBrandsViewDialogOpen(true);
	}, []);

	const handleCreate = useCallback(() => {
		setSelectedBrand(undefined);
		setisBrandsDialogOpen(true);
	}, []);

	useEffect(() => {
		if (brandId && brands && !isFetching && !hasRun.current) {
			const brand = brands.find((b) => b.id === brandId);
			if (brand) {
				handleView(brand);
				hasRun.current = true;
			}
		}
	}, [brandId, brands, isFetching, handleView]);

	return (
		<AuthenticatedLayout>
			<div className="container max-w-5xl px-4 py-8 md:px-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">Brands</h1>
						<p className="mt-1 text-muted-foreground">
							Manage your brand assets and identities.
						</p>
					</div>
					{!brands ||
						(brands.length > 0 && (
							<Button onClick={handleCreate}>
								<Plus className="mr-2 h-4 w-4" />
								Add Brand
							</Button>
						))}
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{brands?.map((brand) => (
						<Card key={brand.id} className="overflow-hidden">
							<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
								<div className="flex items-center gap-3">
									{brand.logoUrl ? (
										<img
											src={brand.logoUrl}
											alt={brand.name}
											className="h-10 w-10 rounded-lg border object-cover"
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold text-sm">
											{brand.name.substring(0, 2).toUpperCase()}
										</div>
									)}
									<div>
										<CardTitle className="text-base">{brand.name}</CardTitle>
										{brand.websiteUrl && (
											<a
												href={brand.websiteUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-0.5 flex items-center gap-1 text-muted-foreground text-xs hover:underline"
											>
												<Globe className="h-3 w-3" />
												{new URL(brand.websiteUrl).hostname}
											</a>
										)}
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handleView(brand)}>
											<Eye className="mr-2 h-4 w-4" />
											View
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleEdit(brand)}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-red-600"
											// onClick={() => deleteBrand(brand.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground text-sm">
									{brand.tagline || "No tagline set"}
								</div>
							</CardContent>
						</Card>
					))}
					{!brands ||
						(brands.length === 0 && (
							<div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
									<Plus className="h-6 w-6 text-muted-foreground" />
								</div>
								<h3 className="font-semibold text-lg">No brands yet</h3>
								<p className="mt-1 mb-4 max-w-sm text-muted-foreground text-sm">
									Create your first brand to start generating content with
									consistent identity.
								</p>
								<Button onClick={handleCreate}>Create Brand</Button>
							</div>
						))}
				</div>

				<BrandDialog
					open={isBrandsDialogOpen}
					mode={brandDialogMode}
					onOpenChange={(open) => {
						setisBrandsDialogOpen(open);
					}}
					brand={selectedBrand}
				/>

				{selectedBrand && (
					<BrandsViewDialog
						open={isBrandsViewDialogOpen}
						onOpenChange={(open) => {
							setisBrandsViewDialogOpen(open);
						}}
						brand={selectedBrand}
					/>
				)}
			</div>
		</AuthenticatedLayout>
	);
}
