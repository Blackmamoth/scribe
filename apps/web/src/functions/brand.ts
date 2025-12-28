import crypto from "node:crypto";
import path from "node:path";
import { env } from "@scribe/core/env";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
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
			throw new APIError("UNPROCESSABLE_ENTITY", "expected form data");
		}

		const logo = data.get("logo");

		if (!logo || !(logo instanceof File)) {
			throw new APIError("UNPROCESSABLE_ENTITY", "valid logo file required");
		}

		const validTypes = ["image/png", "image/jpeg", "image/webp"];
		if (!validTypes.includes(logo.type)) {
			throw new APIError(
				"UNSUPPORTED_MEDIA_TYPE",
				"invalid file type. only PNG, JPEG, and WebP are allowed",
			);
		}

		if (logo.size > MAX_FILE_SIZE) {
			throw new APIError(
				"CONTENT_TOO_LARGE",
				`file too large. maximum size is ${env.MAX_FILE_SIZE_IN_MB}MB`,
			);
		}

		return { logo };
	})
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;

		const { logo } = data;

		const fileExt = path.extname(logo.name);
		const fileName = `${crypto.randomUUID()}${fileExt}`;

		const logger = LOGGER.child({
			user_id: userId,
			file_name: fileName,
			file_size: logo.size,
			file_type: logo.type,
		});

		try {
			const arrayBuffer = await logo.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const result = await uploadToR2(fileName, buffer, logo.type);

			logger.info({ url: result }, "brand logo uploaded successfully");

			return result;
		} catch (error) {
			logger.error(error, "failed to upload brand logo to r2");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to upload logo, please try again",
			);
		}
	});

export const createBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(brandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;

		const logger = LOGGER.child({ user_id: userId, brand_name: data.name });

		try {
			const brandExists = await db.query.brand.findFirst({
				columns: {
					id: true,
				},
				where: (brands, { eq, and }) =>
					and(eq(brands.name, data.name), eq(brands.userId, userId)),
			});

			if (brandExists) {
				logger.warn(
					{ existing_brand_id: brandExists.id },
					"attempted to create duplicate brand",
				);
				throw new APIError(
					"CONFLICT",
					`brand with name '${data.name}' already exists`,
				);
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

			logger.info({ brand_id: newBrand.id }, "brand created successfully");

			return newBrand;
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to insert brand into database");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to save brand, please try again",
			);
		}
	});

export const getBrands = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;

		const logger = LOGGER.child({ user_id: userId });

		try {
			return await db.query.brand.findMany({
				where: (brands, { eq }) => eq(brands.userId, userId),
				limit: data.limit ?? 10,
				offset: data.offset ?? 0,
				orderBy: (brands, { asc }) => [asc(brands.id)],
			});
		} catch (error) {
			logger.error(error, "failed to fetch brand details");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to fetch brand details, please try again",
			);
		}
	});

export const updateBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const { brandId } = data;

		const logger = LOGGER.child({ user_id: userId, brand_id: brandId });

		try {
			const brandExists = await db.query.brand.findFirst({
				columns: {
					id: true,
				},
				where: (brands, { eq, and }) =>
					and(eq(brands.userId, userId), eq(brands.id, brandId)),
			});

			if (!brandExists) {
				logger.warn("attempted to update non-existent or unauthorized brand");
				throw new APIError(
					"NOT_FOUND",
					`brand with id '${brandId} does not exist'`,
				);
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

			const result = await db
				.update(brand)
				.set(updateDetails)
				.where(eq(brand.id, brandId))
				.returning();

			logger.info("successfully updated brand details");

			return result;
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to update brand details");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to update brand details, please try again",
			);
		}
	});

export const deleteBrand = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteBrandSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const brandIds = Array.from(new Set(data.brandIds));

		const logger = LOGGER.child({
			user_id: userId,
			brand_ids: brandIds,
		});

		try {
			const brands = await db.query.brand.findMany({
				columns: {
					id: true,
				},
				where: (brands, { eq, and, inArray }) =>
					and(eq(brands.userId, userId), inArray(brands.id, brandIds)),
			});

			if (!brands || brands.length !== brandIds.length) {
				logger.warn(
					{ found_brands: brands.map((brand) => brand.id) },
					"attempted to delete non-existent or unauthorized brand(s)",
				);
				throw new APIError("BAD_REQUEST", "invalid brand ids");
			}

			await db.delete(brand).where(inArray(brand.id, brandIds));

			logger.info({ count: brands.length }, "brands deleted successfully");
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to delete brand(s)");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to delete brand(s), please try again",
			);
		}
	});
