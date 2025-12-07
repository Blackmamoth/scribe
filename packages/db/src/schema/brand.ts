import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const brand = pgTable("brand", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	logoUrl: text("logo_url"),
	websiteUrl: text("website_url"),
	tagline: text("tagline"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const userBrandRelations = relations(user, ({ many }) => ({
	brands: many(brand),
}));

export const brandRelations = relations(brand, ({ one }) => ({
	user: one(user, {
		fields: [brand.userId],
		references: [user.id],
	}),
}));
