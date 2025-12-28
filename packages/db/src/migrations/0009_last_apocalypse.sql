CREATE TABLE "test_email_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" uuid NOT NULL,
	"email_code_hash" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_email_sends_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "test_email_sends" ADD CONSTRAINT "test_email_sends_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_email_sends" ADD CONSTRAINT "test_email_sends_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "test_email_sent_at_idx" ON "test_email_sends" USING btree ("sent_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_chat_id_unique_idx" ON "test_email_sends" USING btree ("user_id","chat_id");