import { EmailVerification, ResetPasswordEmail } from "@scribe/core/email";
import { env } from "@scribe/core/env";
import { resend } from "@scribe/core/resend";
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
					await resend.emails.send({
						subject: "Email verification for your Scribe account",
						to: data.email,
						from: env.RESEND_SENDER_EMAIL,
						react: EmailVerification({ otpCode: data.otp }),
					});
				} else if (data.type === "forget-password") {
					await resend.emails.send({
						subject: "Reset your Scribe password",
						to: data.email,
						from: env.RESEND_SENDER_EMAIL,
						react: ResetPasswordEmail({ otpCode: data.otp }),
					});
				}
			},
		}),
		tanstackStartCookies(),
	],
});
