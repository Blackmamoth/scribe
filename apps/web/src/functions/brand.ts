import crypto from "node:crypto";
import path from "node:path";
import { env } from "@scribe/core/env";
import { uploadToR2 } from "@scribe/core/r2-client";
import {
	brandSchema,
	deleteBrandSchema,
	getBrandSchema,
	updateBrandSchema,
} from "@scribe/core/validation";
import { db, eq, inArray } from "@scribe/db";
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
		return { logo };
	})
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("unauthenticated");
		}
		const { logo } = data;

		const arrayBuffer = await logo.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const fileExt = path.extname(logo.name);
		const fileName = `${crypto.randomUUID()}${fileExt}`;

		return await uploadToR2(fileName, buffer, logo.type);
	});

export const createBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(brandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
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
				userId,
				logoUrl: data.logoUrl,
				websiteUrl: data.websiteUrl,
				tagline: data.tagline,
				primaryColor: data.primaryColor,
				secondaryColor: data.secondaryColor,
			})
			.returning();

		return newBrand;
	});

export const getBrands = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("unauthenticated");
		}

		const userId = context.session.user.id;

		return await db.query.brand.findMany({
			where: (brands, { eq }) => eq(brands.userId, userId),
			limit: data.limit ?? 10,
			offset: data.offset ?? 0,
			orderBy: (brands, { asc }) => [asc(brands.id)],
		});
	});

export const updateBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("unauthenticated");
		}

		const userId = context.session.user.id;
		const { brandId } = data;

		const brandExists = await db.query.brand.findFirst({
			where: (brands, { eq, and }) =>
				and(eq(brands.userId, userId), eq(brands.id, brandId)),
		});

		if (!brandExists) {
			throw new Error(`brand with id '${brandId} does not exist'`);
		}

		const updateDetails = Object.fromEntries(
			Object.entries(data).filter(([key, value]) => {
				if (key === "brandId") return false;
				if (value === undefined) return false;
				return true;
			}),
		);

		if (Object.keys(updateDetails).length === 0) {
			return brandExists;
		}

		return await db
			.update(brand)
			.set(updateDetails)
			.where(eq(brand.id, brandId))
			.returning();
	});

export const deleteBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("unauthenticated");
		}

		const userId = context.session.user.id;
		const brandIds = Array.from(new Set(data.brandIds));

		const brands = await db.query.brand.findMany({
			where: (brands, { eq, and, inArray }) =>
				and(eq(brands.userId, userId), inArray(brands.id, brandIds)),
		});

		if (!brands || brands.length !== brandIds.length) {
			throw new Error("Invalid brand ids");
		}

		await db.delete(brand).where(inArray(brand.id, brandIds));
	});
