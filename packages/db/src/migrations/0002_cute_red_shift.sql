ALTER TABLE "chat" ALTER COLUMN "tone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "tone" SET DEFAULT 'friendly'::text;--> statement-breakpoint
DROP TYPE "public"."email_tone";--> statement-breakpoint
CREATE TYPE "public"."email_tone" AS ENUM('professional', 'friendly', 'playful', 'urgent', 'empathetic');--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "tone" SET DEFAULT 'friendly'::"public"."email_tone";--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "tone" SET DATA TYPE "public"."email_tone" USING "tone"::"public"."email_tone";