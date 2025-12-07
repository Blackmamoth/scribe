import { env } from "@scribe/core/env";
import { redis } from "@scribe/core/redis";
import { db } from "@scribe/db";
import * as schema from "@scribe/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
	appName: "Scribe",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: false,
	},
	session: {
		cookieCache: {
			enabled: true,
			refreshCache: true,
		},
	},
	secondaryStorage: {
		get: async (key) => await redis.get(key),
		set: async (key, value, ttl) => await redis.set(key, value, "EX", ttl),
		delete: async (key) => {
			await redis.del(key);
		},
	},
	emailVerification: {
		autoSignInAfterVerification: true,
	},
	plugins: [
		emailOTP({
			overrideDefaultEmailVerification: true,
			sendVerificationOnSignUp: true,
			sendVerificationOTP: async (data) => {
				console.log("Email:", data.email);
				console.log("OTP:", data.otp);
			},
		}),
		tanstackStartCookies(),
	],
});
