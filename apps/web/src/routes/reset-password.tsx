import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface SearchParams {
	email: string;
}

export const Route = createFileRoute("/reset-password")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			email: (search.email as string) || "",
		};
	},
	beforeLoad: ({ search }) => {
		if (!search.email) {
			throw redirect({
				to: "/forgot-password",
			});
		}
	},
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
			<ResetPasswordForm email={email} />
		</div>
	);
}
