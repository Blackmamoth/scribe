import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { chat } from "./chat";

export const testEmailSends = pgTable(
	"test_email_sends",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" })
			.unique(),
		chatId: uuid("chat_id")
			.notNull()
			.references(() => chat.id, { onDelete: "cascade" })
			.notNull(),
		emailVersion: integer("email_version").notNull(),
		sentAt: timestamp("sent_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => {
		return [
			index("test_email_sent_at_idx").on(table.sentAt),
			uniqueIndex("user_id_chat_id_unique_idx").on(table.userId, table.chatId),
		];
	},
);
