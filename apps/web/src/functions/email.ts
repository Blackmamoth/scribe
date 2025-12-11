import { env } from "@scribe/core/env";
import { resend } from "@scribe/core/resend";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middleware/auth";

export const sendTestEmail = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.string()) // for now take entire html as input
	.handler(async ({ context, data }) => {
		if (!context.session) {
			throw new Error("Unauthenticated");
		}

		await resend.emails.send({
			subject: "Test email",
			to: context.session.user.email,
			from: env.RESEND_SENDER_EMAIL,
			html: data,
		});
	});
