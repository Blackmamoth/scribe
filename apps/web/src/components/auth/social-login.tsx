import { RiGithubLine, RiGoogleFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";

export default function SocialLogin() {
	const handleOAuthSignup = (_provider: "google" | "github") => {};

	return (
		<div className="grid grid-cols-2 gap-4">
			<Button variant="outline" onClick={() => handleOAuthSignup("google")}>
				<RiGoogleFill className="mr-2 h-4 w-4" />
				Google
			</Button>
			<Button variant="outline" onClick={() => handleOAuthSignup("github")}>
				<RiGithubLine className="mr-2 h-4 w-4" />
				GitHub
			</Button>
		</div>
	);
}
