import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignupForm } from "@/components/auth/signup-form";

export const Route = createFileRoute("/signup")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.user) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignupForm />
		</div>
	);
}
