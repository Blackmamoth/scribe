import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		REDIS_URL: z.url(),
		CORS_ORIGIN: z.url(),
		// CLOUDFLARE
		CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
		R2_API_ENDPOINT: z.url(),
		R2_PUBLIC_URL: z.url(),
		R2_ACCESS_KEY_ID: z.string().min(1),
		R2_ACCESS_KEY: z.string().min(1),
		R2_BUCKET_NAME: z.string().min(1),
		MAX_FILE_SIZE_IN_MB: z.coerce.number().default(5),
		// RESEND
		RESEND_API_KEY: z.string().min(1, "resend api key is required"),
	},
	runtimeEnv: process.env,
});
