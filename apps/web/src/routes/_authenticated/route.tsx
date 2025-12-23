import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/signin" });
		}

		return { user: context.user };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthenticatedLayout>
			<Outlet />
		</AuthenticatedLayout>
	);
}
