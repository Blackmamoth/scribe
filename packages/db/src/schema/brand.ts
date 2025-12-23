import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const brand = pgTable(
	"brand",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		logoUrl: text("logo_url"),
		websiteUrl: text("website_url"),
		tagline: text("tagline"),
		primaryColor: text("primary_color").notNull().default("#0066FF"),
		secondaryColor: text("secondary_color").notNull().default("#FFFFFF"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => {
		return [index("brand_user_id_idx").on(table.userId)];
	},
);

export const userBrandRelations = relations(user, ({ many }) => ({
	brands: many(brand),
}));

export const brandRelations = relations(brand, ({ one }) => ({
	user: one(user, {
		fields: [brand.userId],
		references: [user.id],
	}),
}));
