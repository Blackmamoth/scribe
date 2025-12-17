import { JSXTransformer } from "@scribe/core/email";
import { env } from "@scribe/core/env";
import { resend } from "@scribe/core/resend";
import { db } from "@scribe/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middleware/auth";

export const sendTestEmail = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("Unauthenticated");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const chat = await db.query.chat.findFirst({
			where: (chats, { and, eq }) =>
				and(eq(chats.id, chatId), eq(chats.userId, userId)),
		});

		if (!chat) {
			throw new Error("Invalid chat ID");
		}

		const latestEmailVersion = await db.query.emailVersions.findFirst({
			where: (emailVersions, { eq }) => eq(emailVersions.chatId, chatId),
			orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
		});

		if (!latestEmailVersion) {
			throw new Error("No version of code exists for this chat");
		}

		const transformer = new JSXTransformer();

		let html = "";

		try {
			html = await transformer.renderEmail(latestEmailVersion.code);
		} catch (error) {
			console.error(error);
			throw new Error(
				"Could not generate your email content, please try again",
			);
		}

		await resend.emails.send({
			subject: chat.title,
			to: context.session.user.email,
			from: env.RESEND_SENDER_EMAIL,
			html: html,
		});
	});
