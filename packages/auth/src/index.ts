import { EmailVerification, ResetPasswordEmail } from "@scribe/core/email";
import { sendEmail } from "@scribe/core/email/utils/send-email";
import { env } from "@scribe/core/env";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
// import { redis } from "@scribe/core/redis";
import { db, eq } from "@scribe/db";
import * as schema from "@scribe/db/schema/auth";
import { brand } from "@scribe/db/schema/brand";
import { chat } from "@scribe/db/schema/chat";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, emailOTP } from "better-auth/plugins";
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
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			redirectURI: env.GOOGLE_REDIRECT_URI,
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			redirectURI: env.GITHUB_REDIRECT_URI,
		},
	},
	// secondaryStorage: {
	// 	get: async (key) => await redis.get(key),
	// 	set: async (key, value, ttl) => await redis.set(key, value, "EX", ttl),
	// 	delete: async (key) => {
	// 		await redis.del(key);
	// 	},
	// },
	emailVerification: {
		autoSignInAfterVerification: true,
	},
	plugins: [
		anonymous({
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				const logger = LOGGER.child({
					anonymous_user_id: anonymousUser.user.id,
					new_user_id: newUser.user.id,
				});

				try {
					logger.info("linking guest user data to new user");

					await db.transaction(async (tx) => {
						await tx
							.update(brand)
							.set({ userId: newUser.user.id })
							.where(eq(brand.userId, anonymousUser.user.id));

						await tx
							.update(chat)
							.set({ userId: newUser.user.id })
							.where(eq(chat.userId, anonymousUser.user.id));
					});

					logger.info("successfully linked guest user data");
				} catch (error) {
					logger.error(
						error,
						"database transaction failed to link guest user account",
					);

					throw new APIError(
						"INTERNAL_SERVER_ERROR",
						"an error occured while linking your account",
					);
				}
			},
			generateName: () => {
				const shortId = Math.random()
					.toString(36)
					.substring(2, 6)
					.toUpperCase();
				return `Guest User ${shortId}`;
			},
		}),
		emailOTP({
			overrideDefaultEmailVerification: true,
			sendVerificationOnSignUp: true,
			sendVerificationOTP: async (data) => {
				if (data.type === "email-verification") {
					LOGGER.debug({ ...data }, "otp verification details");

					await sendEmail({
						subject: "Email verification for your Scribe account",
						receiverEmails: data.email,
						react: EmailVerification({ otpCode: data.otp }),
					});
				} else if (data.type === "forget-password") {
					await sendEmail({
						subject: "Reset your Scribe password",
						receiverEmails: data.email,
						react: ResetPasswordEmail({ otpCode: data.otp }),
					});
				}
			},
		}),
		tanstackStartCookies(),
	],
});
