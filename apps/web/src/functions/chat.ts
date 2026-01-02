import { generateChatTitle } from "@scribe/core/ai/service/chat-title";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
import {
	createChatSchema,
	getRecentChatsSchema,
} from "@scribe/core/validation";
import { and, db, eq, inArray } from "@scribe/db";
import { chat, chatMessage } from "@scribe/db/schema/chat";
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

export const getEmailVersions = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ chatId: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const { chatId } = data;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chatExists = await db.query.chat.findFirst({
				columns: { id: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chatExists) {
				logger.warn(
					"attempted to fetch versions for non-existent or unauthorized chat",
				);
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const versions = await db.query.emailVersions.findMany({
				columns: {
					id: true,
					version: true,
					createdAt: true,
					chatMessageId: true,
				},
				where: (emailVersions, { eq }) => eq(emailVersions.chatId, chatId),
				orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
			});

			return versions;
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to fetch email versions from database");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to fetch email versions, please try again",
			);
		}
	});

export const rollbackToVersion = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ chatId: z.uuid(), versionId: z.uuid() }))
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new APIError("UNAUTHENTICATED", "unauthenticated");
		}

		const userId = context.session.user.id;
		const { chatId, versionId } = data;

		const logger = LOGGER.child({ user_id: userId, chat_id: chatId });

		try {
			const chatExists = await db.query.chat.findFirst({
				columns: { id: true },
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			});

			if (!chatExists) {
				logger.warn("attempted to rollback non-existent or unauthorized chat");
				throw new APIError("BAD_REQUEST", "invalid chat id");
			}

			const targetVersion = await db.query.emailVersions.findFirst({
				columns: {
					id: true,
					version: true,
					code: true,
					chatMessageId: true,
				},
				with: {
					message: {
						columns: {
							createdAt: true,
						},
					},
				},
				where: (emailVersions, { and, eq }) =>
					and(
						eq(emailVersions.chatId, chatId),
						eq(emailVersions.id, versionId),
					),
			});

			if (!targetVersion) {
				logger.warn("attempted to rollback to non-existent version");
				throw new APIError("BAD_REQUEST", "invalid version id");
			}

			await db.transaction(async (tx) => {
				const messages = await tx.query.chatMessage.findMany({
					columns: { id: true, role: true },
					where: (chatMessages, { and, eq, gte }) =>
						and(
							eq(chatMessages.chatId, chatId),
							gte(chatMessages.createdAt, targetVersion.message.createdAt),
						),
					orderBy: (chatMessages, { asc }) => asc(chatMessages.createdAt),
				});

				const keepCount = messages[1]?.role === "assistant" ? 2 : 1;
				const messageIdsToDelete = messages.slice(keepCount).map((m) => m.id);

				if (messageIdsToDelete.length > 0) {
					await tx
						.delete(chatMessage)
						.where(inArray(chatMessage.id, messageIdsToDelete));
				}
			});

			return {
				code: targetVersion.code,
				version: targetVersion.version,
			};
		} catch (error) {
			if (error instanceof APIError) throw error;
			logger.error(error, "failed to rollback chat");
			throw new APIError(
				"INTERNAL_SERVER_ERROR",
				"failed to rollback chat, please try again",
			);
		}
	});
