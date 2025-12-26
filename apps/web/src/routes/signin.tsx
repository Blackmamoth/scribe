import { createFileRoute, redirect } from "@tanstack/react-router";
import { SigninForm } from "@/components/auth/signin-form";

export const Route = createFileRoute("/signin")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.user && !context.user.isAnonymous) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SigninForm />
		</div>
	);
}
