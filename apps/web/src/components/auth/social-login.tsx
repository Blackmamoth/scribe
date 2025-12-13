import type { SetStateAction } from "react";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface Props {
	isLoading: boolean;
	setIsLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function SocialLogin({ isLoading, setIsLoading }: Props) {
	const handleOAuthSignup = async (provider: "google" | "github") => {
		await authClient.signIn.social(
			{
				provider,
				callbackURL: "/",
			},
			{
				onSuccess: () => {
					setIsLoading(false);
				},
				onError: async (ctx) => {
					setIsLoading(false);
					toast.error(ctx.error.message);
				},
			},
		);
	};

	return (
		<div className="grid grid-cols-2 gap-4">
			<Button
				disabled={isLoading}
				variant="outline"
				onClick={() => handleOAuthSignup("google")}
			>
				<RiGoogleFill className="mr-2 h-4 w-4" />
				Google
			</Button>
			<Button
				disabled={isLoading}
				variant="outline"
				onClick={() => handleOAuthSignup("github")}
			>
				<RiGithubLine className="mr-2 h-4 w-4" />
				GitHub
			</Button>
		</div>
	);
}
