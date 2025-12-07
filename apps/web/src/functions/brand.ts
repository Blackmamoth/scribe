import crypto from "node:crypto";
import path from "node:path";
import { env } from "@scribe/core/env";
import { uploadToR2 } from "@scribe/core/r2-client";
import { brandSchema, getBrandSchema } from "@scribe/core/validation";
import { db } from "@scribe/db";
import { brand } from "@scribe/db/schema/brand";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware/auth";

const MAX_FILE_SIZE = env.MAX_FILE_SIZE_IN_MB * 1024 * 1024;

export const uploadBrandLogo = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data) => {
		if (!(data instanceof FormData)) {
			throw new Error("expected form data");
		}

		const logo = data.get("logo");

		if (!logo || !(logo instanceof File)) {
			throw new Error("valid logo file required");
		}

		const validTypes = [
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/svg+xml",
		];
		if (!validTypes.includes(logo.type)) {
			throw new Error(
				"invalid file type. only PNG, JPEG, WebP, and SVG are allowed",
			);
		}

		if (logo.size > MAX_FILE_SIZE) {
			throw new Error(
				`file too large. maximum size is ${env.MAX_FILE_SIZE_IN_MB}MB`,
			);
		}
		return {
			logo,
		};
	})
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("unauthenticated");
		}

		const logo = data.logo;

		const arrayBuffer = await logo.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const fileExt = path.extname(logo.name);

		const fileName = `${crypto.randomUUID()}${fileExt}`;

		const logoUrl = await uploadToR2(fileName, buffer, logo.type);

		return logoUrl;
	});

export const createBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(brandSchema)
	.handler(async ({ context, data }) => {
		if (context.session === null) {
			throw new Error("unauthenticated");
		}

		const userId = context.session.user.id;

		const brandExists = await db.query.brand.findFirst({
			where: (brands, { eq, and }) =>
				and(eq(brands.name, data.name), eq(brands.userId, userId)),
		});

		if (brandExists) {
			throw new Error(`brand with name '${data.name}' already exists`);
		}

		const [newBrand] = await db
			.insert(brand)
			.values({
				name: data.name,
				userId: userId,
				logoUrl: data.logoUrl,
				websiteUrl: data.websiteUrl,
				tagline: data.tagline,
			})
			.returning();

		return newBrand;
	});

export const getBrands = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getBrandSchema)
	.handler(async ({ context, data }) => {
		if (context.session === null) {
			throw new Error("unauthenticated");
		}

		const userId = context.session.user.id;

		const brands = await db.query.brand.findMany({
			where: (brands, { eq }) => eq(brands.userId, userId),
			limit: data.limit ?? 10,
			offset: data.offset ?? 0,
			orderBy: (brands, { asc }) => [asc(brands.id)],
		});

		return brands;
	});
