import { handleChat, parseScribeResponse } from "@scribe/core/ai/service/chat";
import { chatSchema } from "@scribe/core/validation";
import { db, eq } from "@scribe/db";
import { chat, chatMessage, emailVersions } from "@scribe/db/schema/chat";
import type { Brand } from "@scribe/db/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { authMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/api/chat")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ context, request }) => {
				try {
					if (!context.session) {
						return json({ message: "unauthenticated" }, { status: 401 });
					}

					const userId = context.session.user.id;

					const jsonBody = await request.json();

					const { success, data, error } =
						await chatSchema.safeParseAsync(jsonBody);

					if (!success) {
						throw new Error(error.message);
					}

					const messages: UIMessage[] | undefined = jsonBody?.messages;

					if (messages === undefined || messages.length === 0) {
						throw new Error("messages are required");
					}

					const latestUserMessage = messages.slice(-1)[0];

					const { chatId, brandId } = data;

					const chatExists = await db.query.chat.findFirst({
						where: (chats, { and, eq }) =>
							and(eq(chats.userId, userId), eq(chats.id, chatId)),
					});

					if (!chatExists) {
						throw new Error("Invalid chat ID");
					}

					let brand: Brand | undefined;

					if (brandId) {
						brand = await db.query.brand.findFirst({
							where: (brands, { and, eq }) =>
								and(eq(brands.userId, userId), eq(brands.id, brandId)),
						});
					}

					const stream = handleChat(
						messages,
						chatExists.preset as string,
						chatExists.tone as string,
						{
							name: brand?.name,
							logoUrl: brand?.logoUrl || "",
							tagline: brand?.tagline || "",
							websiteUrl: brand?.websiteUrl || "",
							primaryColor: brand?.primaryColor || "",
							secondaryColor: brand?.secondaryColor || "",
						},
					);

					return stream.toUIMessageStreamResponse({
						sendReasoning: true,
						onFinish: async ({ responseMessage }) => {
							const responseText = responseMessage.parts
								.map((part) => (part.type === "text" ? part.text : ""))
								.join("");
							const { assistant, code } = parseScribeResponse(responseText);

							const userMessage = latestUserMessage.parts
								.map((part) => (part.type === "text" ? part.text : ""))
								.join("");

							const insertArr = [
								{ chatId, message: userMessage, role: "user" as const },
								{ chatId, message: assistant, role: "assistant" as const },
							];

							insertArr.unshift();

							await db.transaction(async (tx) => {
								const newChatMessages = await tx
									.insert(chatMessage)
									.values(insertArr)
									.returning({ chatMessageId: chatMessage.id });

								if (code?.trim()) {
									let version = 1;

									const latestVersion = await tx.query.emailVersions.findFirst({
										where: (emailVersions, { eq }) =>
											eq(emailVersions.chatId, chatId),
										orderBy: (emailVersions, { desc }) =>
											desc(emailVersions.version),
									});

									version += latestVersion?.version ?? 0;

									const chatMessageId = newChatMessages[0].chatMessageId;

									await tx.insert(emailVersions).values({
										chatId,
										code,
										version,
										chatMessageId,
									});
								}

								const chatUpdateDetails: Partial<typeof chat.$inferInsert> = {
									updatedAt: new Date(),
								};

								if (
									data.emailPreset &&
									data.emailPreset !== chatExists.preset
								) {
									chatUpdateDetails.preset = data.emailPreset;
								}

								if (data.emailTone && data.emailTone !== chatExists.tone) {
									chatUpdateDetails.tone = data.emailTone;
								}

								if (data.brandId && data.brandId !== chatExists.brandId) {
									chatUpdateDetails.brandId = data.brandId;
								}

								await tx
									.update(chat)
									.set(chatUpdateDetails)
									.where(eq(chat.id, chatId));
							});
						},
					});
				} catch (error) {
					console.error(error);
					return json(
						{ message: "request failed, please try again later" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
