import { generateChatTitle } from "@scribe/core/ai/service/chat-title";
import { createChatSchema } from "@scribe/core/validation";
import { db } from "@scribe/db";
import { chat, chatMessage } from "@scribe/db/schema/chat";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middleware/auth";

export const createChat = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createChatSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("Unauthenticated");
		}

		const userId = context.session.user.id;

		const chatTitle = await generateChatTitle(data.prompt);

		let chatId = "";

		await db.transaction(async (tx) => {
			const [newChat] = await tx
				.insert(chat)
				.values({
					title: chatTitle,
					userId,
				})
				.returning({ chatId: chat.id });

			if (!newChat) {
				throw new Error("failed to create chat");
			}

			chatId = newChat.chatId;

			await tx.insert(chatMessage).values({
				chatId: chatId,
				message: data.prompt,
				role: "user",
			});
		});

		return chatId;
	});

export const getChatMessages = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.uuid())
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("Unauthenticated");
		}

		const userId = context.session.user.id;

		const chat = await db.query.chat.findFirst({
			where: (chats, { and, eq }) =>
				and(eq(chats.userId, userId), eq(chats.id, data)),
		});

		if (!chat) {
			throw new Error("Invalid chat ID");
		}

		const chatMessages = await db.query.chatMessage.findMany({
			where: (messages, { eq }) => eq(messages.chatId, chat.id),
			orderBy: (messages, { asc }) => asc(messages.createdAt),
		});

		return chatMessages;
	});

export const getLatestEmailCode = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.uuid())
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("Unauthenticated");
		}

		const userId = context.session.user.id;

		const chat = await db.query.chat.findFirst({
			where: (chats, { and, eq }) =>
				and(eq(chats.userId, userId), eq(chats.id, data)),
		});

		if (!chat) {
			throw new Error("Invalid chat ID");
		}

		const emailVersionData = await db.query.emailVersions.findFirst({
			where: (emailVersions, { eq }) => eq(emailVersions.chatId, chat.id),
			orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
		});

		return emailVersionData?.code ?? "";
	});
