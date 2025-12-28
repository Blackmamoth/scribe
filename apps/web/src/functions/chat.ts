import { generateChatTitle } from "@scribe/core/ai/service/chat-title";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
import {
	createChatSchema,
	getRecentChatsSchema,
} from "@scribe/core/validation";
import { and, db, eq } from "@scribe/db";
import { chat } from "@scribe/db/schema/chat";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middleware/auth";

export const getChat = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chat = await db.query.chat.findFirst({
				columns: { id: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chat) {
				logger.warn("attempted to fetch a non-existent or unauthorized chat");
				throw new APIError(
					"NOT_FOUND",
					`chat with id [${chatId}] does not exist`,
				);
			}

			return chat;
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(
				error,
				"an unexpected error occured while fetching chat details",
			);
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"an unexpected error occured while fetching chat details, please try again",
			);
		}
	});

export const createChat = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createChatSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const logger = LOGGER.child({ user_id: userId });

		try {
			const chatTitle = await generateChatTitle(data.prompt);

			const [newChat] = await db
				.insert(chat)
				.values({
					title: chatTitle,
					userId,
					brandId: data.brandId,
					tone: data.emailTone,
					preset: data.emailPreset,
				})
				.returning({ chatId: chat.id });

			return newChat.chatId;
		} catch (error) {
			logger.error(error, "failed to insert new chat");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to create a chat, please try again",
			);
		}
	});

export const getRecentChats = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(getRecentChatsSchema)
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;

		const logger = LOGGER.child({ user_id: userId });

		try {
			const chats = await db.query.chat.findMany({
				where: (chats, { eq }) => eq(chats.userId, userId),
				orderBy: (chats, { desc }) => desc(chats.updatedAt),
				limit: data.limit,
				offset: data.offset,
			});

			return chats;
		} catch (error) {
			logger.error(
				error,
				"an unexpected error occured while fetching chat list",
			);
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"an unexpected error occured while fetching chat list",
			);
		}
	});

export const getChatSession = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chat = await db.query.chat.findFirst({
				columns: { id: true, brandId: true, tone: true, preset: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chat) {
				logger.warn(
					"attempted to fetch session of a non-existent or unauthorized chat",
				);
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const chatMessages = await db.query.chatMessage.findMany({
				where: (messages, { eq }) => eq(messages.chatId, chat.id),
				orderBy: (messages, { asc }) => asc(messages.createdAt),
			});

			return {
				chatMessages,
				brandId: chat.brandId,
				tone: chat.tone,
				preset: chat.preset,
			};
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(
				error,
				"an unexpected error occured while fetching chat messages",
			);
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"an unexpected error occured while fetching your chat messages",
			);
		}
	});

export const getLatestEmailCode = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chat = await db.query.chat.findFirst({
				columns: { id: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chat) {
				logger.warn(
					{ user_id: userId, chat_id: chatId },
					"attempted to fetch email code for non-existent or unauthorized chat",
				);
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const emailVersionData = await db.query.emailVersions.findFirst({
				columns: { code: true },
				where: (emailVersions, { eq }) => eq(emailVersions.chatId, chat.id),
				orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
			});

			return emailVersionData?.code ?? "";
		} catch (error) {
			if (error instanceof APIError) throw error;

			logger.error(
				error,
				"an unexpected error occured while fetching latest email code",
			);
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"an unexpected error occured while fetching latest email code",
			);
		}
	});

export const deleteChat = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const chatId = data.id;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chatExists = await db.query.chat.findFirst({
				columns: { id: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chatExists) {
				logger.warn("attempted to delete a non-existent or unauthorized chat");
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const result = await db
				.delete(chat)
				.where(and(eq(chat.userId, userId), eq(chat.id, chatId)))
				.returning();

			return result;
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to delete chat from database");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to delete chat, please try again",
			);
		}
	});
