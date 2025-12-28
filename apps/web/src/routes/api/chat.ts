import crypto from "node:crypto";
import { applyDiff, formatApplyError, parseDiff } from "@scribe/core/ai";
import { handleChat, parseScribeResponse } from "@scribe/core/ai/service/chat";
import { APIError } from "@scribe/core/errors";
import LOGGER from "@scribe/core/logger";
import { chatSchema } from "@scribe/core/validation";
import { db, eq } from "@scribe/db";
import { chat, chatMessage, emailVersions } from "@scribe/db/schema/chat";
import type { Chat, EmailPreset, EmailTone } from "@scribe/db/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { authMiddleware } from "@/middleware/auth";

async function validateChatRequest(
	userId: string,
	chatId: string,
	brandId?: string | null,
) {
	const logger = LOGGER.child({
		user_id: userId,
		chat_id: chatId,
		brand_id: brandId,
	});

	try {
		const [chatExists, brand] = await Promise.all([
			db.query.chat.findFirst({
				where: (chats, { and, eq }) =>
					and(eq(chats.userId, userId), eq(chats.id, chatId)),
			}),
			brandId
				? db.query.brand.findFirst({
						where: (brands, { and, eq }) =>
							and(eq(brands.userId, userId), eq(brands.id, brandId)),
					})
				: Promise.resolve(undefined),
		]);

		if (!chatExists) {
			logger.warn("attempted to fetch non-existent or unauthorized chat");
			throw new APIError("BAD_REQUEST", "invalid chat id");
		}

		return { chat: chatExists, brand };
	} catch (error) {
		if (error instanceof APIError) throw error;
		logger.error(
			error,
			"unexpected error occured while fetching chat and brand details from database",
		);
		throw new APIError(
			"INTERNAL_SERVER_ERROR",
			"failed to fetch chat details, please try again",
		);
	}
}

async function saveChatResponse(
	chatId: string,
	latestUserMessage: UIMessage,
	responseMessage: UIMessage,
	latestVersion:
		| {
				id: string;
				createdAt: Date;
				chatId: string;
				code: string;
				chatMessageId: string;
				version: number;
		  }
		| null
		| undefined,
	data: {
		emailPreset: EmailPreset;
		emailTone: EmailTone;
		brandId?: string | null;
	},
	chatExists: Chat,
) {
	const responseText = responseMessage.parts
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");
	const { assistant, code, diff, isDiff } = parseScribeResponse(responseText);

	let finalCode = code;
	let diffError: string | null = null;
	let newVersion = 1;

	const logger = LOGGER.child({
		chat_id: chatExists.id,
		user_id: chatExists.userId,
	});

	if (isDiff && diff && latestVersion?.code) {
		newVersion += latestVersion.version;
		const parsedDiff = parseDiff(diff);
		const result = applyDiff(latestVersion.code, parsedDiff);

		if (result.success) {
			finalCode = result.code;
		} else {
			diffError = formatApplyError(result);
			logger.error(
				{ diff_error: diffError, current_version: latestVersion.version },
				"failed to apply diff of the latest email code",
			);
		}
	}

	const userMessage = latestUserMessage.parts
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");

	const insertArr = [
		{ chatId, message: userMessage, role: "user" as const },
		{ chatId, message: assistant, role: "assistant" as const },
	];

	try {
		await db.transaction(async (tx) => {
			const [newChatMessages] = await tx
				.insert(chatMessage)
				.values(insertArr)
				.returning({ chatMessageId: chatMessage.id });

			if (finalCode?.trim() && !diffError) {
				const chatMessageId = newChatMessages.chatMessageId;

				if (chatMessageId) {
					await tx.insert(emailVersions).values({
						chatId,
						code: finalCode,
						version: newVersion,
						chatMessageId,
					});
				}
			}

			const chatUpdateDetails: Partial<typeof chat.$inferInsert> = {
				updatedAt: new Date(),
			};

			if (data.emailPreset && data.emailPreset !== chatExists.preset) {
				chatUpdateDetails.preset = data.emailPreset;
			}

			if (data.emailTone && data.emailTone !== chatExists.tone) {
				chatUpdateDetails.tone = data.emailTone;
			}

			if (data.brandId && data.brandId !== chatExists.brandId) {
				chatUpdateDetails.brandId = data.brandId;
			}

			await tx.update(chat).set(chatUpdateDetails).where(eq(chat.id, chatId));
		});
	} catch (error) {
		logger.error(error, "transaction failed to save chat details");
		throw new APIError(
			"INTERNAL_SERVER_ERROR",
			"an error occured while saving your latest chat",
		);
	}
}

export const Route = createFileRoute("/api/chat")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ context, request }) => {
				const logger = LOGGER.child({});

				try {
					if (!context.session) {
						throw new APIError("UNAUTHENTICATED", "unauthenticated");
					}

					const userId = context.session.user.id;
					const jsonBody = await request.json();

					const { success, data, error } =
						await chatSchema.safeParseAsync(jsonBody);
					if (!success) {
						throw new APIError("UNPROCESSABLE_ENTITY", error.message);
					}

					const messages: UIMessage[] = jsonBody?.messages;
					if (!messages?.length) {
						throw new APIError("UNPROCESSABLE_ENTITY", "messages are required");
					}

					const { chatId, brandId, emailPreset, emailTone } = data;
					const latestUserMessage = messages[messages.length - 1];

					logger.setBindings({ user_id: userId, chat_id: chatId });

					const [latestVersion, { chat, brand }] = await Promise.all([
						db.query.emailVersions.findFirst({
							where: (emailVersions, { eq }) =>
								eq(emailVersions.chatId, chatId),
							orderBy: (emailVersions, { desc }) => desc(emailVersions.version),
						}),
						validateChatRequest(userId, chatId, brandId),
					]);

					if (latestVersion) {
						messages.splice(messages.length - 1, 0, {
							id: crypto.randomUUID(),
							role: "system",
							parts: [
								{
									type: "text",
									text: `Here is the current email code (version ${latestVersion.version}) that you should modify:\n\n${latestVersion.code}`,
								},
							],
						});
					}

					const stream = handleChat(messages, emailPreset, emailTone, {
						name: brand?.name,
						logoUrl: brand?.logoUrl || "",
						tagline: brand?.tagline || "",
						websiteUrl: brand?.websiteUrl || "",
						primaryColor: brand?.primaryColor || "",
						secondaryColor: brand?.secondaryColor || "",
					});

					return stream.toUIMessageStreamResponse({
						sendReasoning: true,
						onFinish: async ({ responseMessage }) => {
							await saveChatResponse(
								chatId,
								latestUserMessage,
								responseMessage,
								latestVersion,
								data,
								chat,
							);
						},
					});
				} catch (error) {
					logger.error(error, "failed to process chat api request");

					if (error instanceof APIError) {
						return json(
							{ message: error.message },
							{ status: error.statusCode },
						);
					}

					return json(
						{ message: "request failed, please try again later" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
