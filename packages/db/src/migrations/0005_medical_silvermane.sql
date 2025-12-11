ALTER TABLE "chat" DROP CONSTRAINT "chat_brand_id_brand_id_fk";
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE set null ON UPDATE no action;