import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
	server: {
		// DATABASE
		DATABASE_URL: z.url(),
		MAX_DB_CONNECTIONS: z.coerce.number().default(10),
		MIN_DB_CONNECTIONS: z.coerce.number().default(2),
		IDLE_TIMEOUT_IN_SECONDS: z.coerce.number().default(30),
		CONNECTION_TIMEOUT_IN_SECONDS: z.coerce.number().default(5),

		REDIS_URL: z.url().optional(),
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
		RESEND_API_KEY: z.string().min(1),
		RESEND_SENDER_EMAIL: z.email(),
		// GOOGLE OAUTH
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		GOOGLE_REDIRECT_URI: z.url(),
		// GITHUB OAUTH
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),
		GITHUB_REDIRECT_URI: z.url(),
	},
	runtimeEnv: process.env,
});
