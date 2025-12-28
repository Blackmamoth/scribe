import { JSXTransformer } from "@scribe/core/email";
import { sendEmail } from "@scribe/core/email/utils/send-email";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
import { db } from "@scribe/db";
import { testEmailSends } from "@scribe/db/schema/test-email";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middleware/auth";

export const sendTestEmail = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		if (context.session.user.isAnonymous) {
			throw new APIError("FORBIDDEN", "sign in to send a test email");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chat = await db.query.chat.findFirst({
				where: (chats, { and, eq }) =>
					and(eq(chats.id, chatId), eq(chats.userId, userId)),
			});

			if (!chat) {
				logger.warn(
					"attempted to send test email of a non-existent or unauthorized chat",
				);
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const latestEmailVersion = await db.query.emailVersions.findFirst({
				columns: { code: true, version: true },
				where: (emailVersions, { eq }) => eq(emailVersions.chatId, chatId),
				orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
			});

			if (!latestEmailVersion) {
				logger.warn("attempted to send test email of a chat without an email");
				throw new APIError(
					"BAD_REQUEST",
					"this chat does not have a valid email body",
				);
			}

			const lastSentEmail = await db.query.testEmailSends.findFirst({
				where: (emailLogs, { and, eq }) =>
					and(eq(emailLogs.userId, userId), eq(emailLogs.chatId, chatId)),
			});

			if (
				lastSentEmail?.sentAt &&
				lastSentEmail?.emailVersion === latestEmailVersion.version
			) {
				throw new APIError(
					"TOO_MANY_REQUESTS",
					"this email version was already sent, make changes to send again.",
				);
			}

			const transformer = new JSXTransformer();

			const html = await transformer.renderEmail(latestEmailVersion.code);

			await sendEmail({
				subject: chat.title,
				receiverEmails: context.session.user.email,
				html: html,
			});

			await db
				.insert(testEmailSends)
				.values({
					userId,
					chatId,
					emailVersion: latestEmailVersion.version,
				})
				.onConflictDoUpdate({
					target: testEmailSends.userId,
					set: {
						sentAt: new Date(),
						emailVersion: latestEmailVersion.version,
					},
				});
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to send test email using resend");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to send test email, please try again later",
			);
		}
	});
