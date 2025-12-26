import type { auth } from "@scribe/auth";
import {
	anonymousClient,
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		anonymousClient(),
		emailOTPClient(),
		inferAdditionalFields<typeof auth>(),
	],
});
