import type { auth } from "@scribe/auth";
import {
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});
