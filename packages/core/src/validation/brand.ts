import * as z from "zod";

export const brandSchema = z.object({
	name: z.string().min(1, "brand name is required"),
	logoUrl: z.url().optional(),
	websiteUrl: z.url().optional(),
	tagline: z.string().optional(),
});

export const getBrandSchema = z.object({
	limit: z.coerce.number().int().optional(),
	offset: z.coerce.number().int().optional(),
});
