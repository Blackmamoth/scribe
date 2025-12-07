import type { Brand } from "@scribe/db/types";
import { useForm } from "@tanstack/react-form";
import { Upload, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrand } from "@/hooks/brand";

interface BrandDialogProps {
	open: boolean;
	mode: "create" | "edit";
	onOpenChange: (open: boolean) => void;
	brand?: Brand;
}

export function BrandDialog({
	open,
	onOpenChange,
	brand,
	mode,
}: BrandDialogProps) {
	const { createBrand, uploadBrand, isUploading, isCreating } = useBrand();

	const form = useForm({
		defaultValues: {
			name: brand?.name || "",
			websiteUrl: brand?.websiteUrl || "",
			logo: null as File | null,
			logoUrl: brand?.logoUrl || "",
			tagline: brand?.tagline || "",
		},
		onSubmit: async ({ value }) => {
			try {
				let logoUrl = "";
				if (value.logo) {
					const formData = new FormData();
					formData.append("logo", value.logo);
					logoUrl = await uploadBrand(formData);
				}

				await createBrand({
					name: value.name,
					logoUrl: logoUrl,
					websiteUrl: value.websiteUrl ?? "",
					tagline: value.tagline ?? "",
				});

				onOpenChange(false);
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong");
			}
		},
	});

	useEffect(() => {
		if (open) {
			form.reset();
			if (brand) {
				form.setFieldValue("name", brand.name);
				form.setFieldValue("websiteUrl", brand.websiteUrl || "");
				form.setFieldValue("logoUrl", brand.logoUrl || "");
				form.setFieldValue("logo", null);
				form.setFieldValue("tagline", brand.tagline || "");
			}
		}
	}, [open, brand, form]);

	const getCardTitle = () => {
		switch (mode) {
			case "create":
				return "Create Brand";
			case "edit":
				return "Edit Brand";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{getCardTitle()}</DialogTitle>
					<DialogDescription>
						{brand
							? "Update your brand details below."
							: "Add a new brand to your workspace."}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="name"
						validators={{
							onChange: z.string().min(1, "Name is required"),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Acme Corp"
								/>
								{field.state.meta.errors && field.state.meta.isDirty && (
									<p className="text-red-500 text-sm">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="websiteUrl"
						validators={{
							onChange: z.url("Please enter a valid URL").or(z.literal("")),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="website">Website</Label>
								<Input
									id="website"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="https://acme.com"
								/>
								{field.state.meta.errors && field.state.meta.isDirty && (
									<p className="text-red-500 text-sm">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="logoUrl">
						{(previewField) => (
							<form.Field name="logo">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="logo">Logo</Label>
										<div className="flex items-center gap-4">
											{previewField.state.value ? (
												<div className="group relative h-16 w-16 overflow-hidden rounded-lg border">
													<img
														src={previewField.state.value}
														alt="Logo preview"
														className="h-full w-full object-cover"
													/>
													<button
														type="button"
														onClick={() => {
															previewField.handleChange("");
															field.handleChange(null);
														}}
														className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
													>
														<X className="h-4 w-4 text-white" />
													</button>
												</div>
											) : (
												<div
													onClick={() =>
														document.getElementById("logo-upload")?.click()
													}
													className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors hover:bg-muted/50"
												>
													<Upload className="h-4 w-4 text-muted-foreground" />
												</div>
											)}
											<div className="flex-1">
												<Input
													id="logo-upload"
													type="file"
													accept="image/*"
													className="hidden"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) {
															field.handleChange(file);
															const reader = new FileReader();
															reader.onloadend = () => {
																previewField.handleChange(
																	reader.result as string,
																);
															};
															reader.readAsDataURL(file);
														}
													}}
												/>
												<div className="text-muted-foreground text-sm">
													{previewField.state.value
														? "Click the X to remove and upload a new logo."
														: "Click to upload a brand logo (max 2MB)."}
												</div>
											</div>
										</div>
									</div>
								)}
							</form.Field>
						)}
					</form.Field>

					<form.Field
						name="tagline"
						validators={{
							onChange: z.string().or(z.literal("")),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="tagline">Tagline</Label>
								<Input
									id="tagline"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Just Do It"
								/>
								{field.state.meta.errors && field.state.meta.isDirty && (
									<p className="text-red-500 text-sm">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button disabled={isUploading || isCreating} type="submit">
							{brand ? "Save Changes" : "Create Brand"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
