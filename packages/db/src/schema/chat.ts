import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { brand } from "./brand";

export const emailToneEnum = pgEnum("email_tone", [
	"professional",
	"friendly",
	"playful",
	"urgnet",
	"empathetic",
]);

export const emailPresetEnum = pgEnum("email_preset", [
	"cold_email",
	"newsletter",
	"follow_up",
	"announcement",
	"welcome_series",
]);

export const messageRoleEnum = pgEnum("message_role", [
	"user",
	"assistant",
	"system",
]);

export const chat = pgTable("chat", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	brandId: uuid("brand_id").references(() => brand.id),
	title: text("name").notNull(),
	tone: emailToneEnum().default("friendly"),
	preset: emailPresetEnum().default("welcome_series"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const chatMessage = pgTable("chat_message", {
	id: uuid("id").primaryKey().defaultRandom(),
	chatId: uuid("chat_id")
		.notNull()
		.references(() => chat.id, { onDelete: "cascade" }),
	message: text("message").notNull(),
	role: messageRoleEnum().default("user").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVersions = pgTable(
	"email_versions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		chatId: uuid("chat_id")
			.notNull()
			.references(() => chat.id, { onDelete: "cascade" }),
		code: text("code").notNull(),
		version: integer("version").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => {
		return [uniqueIndex("chat_version_unique").on(table.chatId, table.version)];
	},
);

export const userChatRelations = relations(user, ({ many }) => ({
	chats: many(chat),
}));

export const chatRelations = relations(chat, ({ one }) => ({
	user: one(user, {
		fields: [chat.userId],
		references: [user.id],
	}),
	brand: one(brand, {
		fields: [chat.brandId],
		references: [brand.id],
	}),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
	chat: one(chat, {
		fields: [chatMessage.chatId],
		references: [chat.id],
	}),
}));
