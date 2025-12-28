import type { JSX } from "react";
import type { CreateEmailOptions } from "resend";
import { env } from "../../env";
import { APIError } from "../../errors";
import LOGGER from "../../logger";
import { resend } from "../../resend";

interface EmailInput {
	receiverEmails: string | string[];
	subject: string;
	html?: string;
	react?: JSX.Element;
}

export const sendEmail = async (emailInput: EmailInput) => {
	if (!emailInput.html && !emailInput.react) {
		throw new APIError(
			"BAD_REQUEST",
			"you need to pass either html or a jsx element for the body of the email",
		);
	}

	if (emailInput.html && emailInput.react) {
		throw new APIError(
			"BAD_REQUEST",
			"you cannot pass both html and react, please provide only one",
		);
	}

	const emailContent: CreateEmailOptions = emailInput.react
		? {
				subject: emailInput.subject,
				to: emailInput.receiverEmails,
				from: env.RESEND_SENDER_EMAIL,
				react: emailInput.react,
			}
		: {
				subject: emailInput.subject,
				to: emailInput.receiverEmails,
				from: env.RESEND_SENDER_EMAIL,
				html: emailInput.html ?? "",
			};

	const result = await resend.emails.send(emailContent);

	if (result.error) {
		LOGGER.error({
			error_response: result.error,
			response_headers: result.headers,
		});
		throw new APIError(
			"INTERNAL_SERVER_ERROR",
			"failed to send email, please try again later",
		);
	}

	LOGGER.info(
		{ resend_email_id: result.data.id, response_headers: result.headers },
		"successfully sent email",
	);
};
