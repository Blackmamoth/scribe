import * as z from "zod";

export const brandSchema = z.object({
	name: z.string().min(1, "brand name is required"),
	logoUrl: z.url().nullish(),
	websiteUrl: z.url().nullish(),
	tagline: z.string().nullish(),
	primaryColor: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex code")
		.optional(),
	secondaryColor: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex code")
		.optional(),
});

export const getBrandSchema = z.object({
	limit: z.coerce.number().int().optional(),
	offset: z.coerce.number().int().optional(),
});

export const updateBrandSchema = brandSchema.partial().extend({
	brandId: z.uuid(),
});

export const deleteBrandSchema = z.object({
	brandIds: z.array(z.uuid()),
});
