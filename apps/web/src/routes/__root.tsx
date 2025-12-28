import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../index.css?url";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider } from "next-themes";
import { NotFound } from "@/components/not-found";
import { getUser } from "@/functions/get-user";

export interface RouterAppContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Scribe",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	beforeLoad: async () => {
		try {
			const session = await getUser();
			if (session === null) {
				return { user: undefined, session: undefined };
			}

			return { user: session.user, session: session.session };
		} catch (_error) {
			return { user: undefined, session: undefined };
		}
	},

	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument() {
	const { queryClient } = Route.useRouteContext();

	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QueryClientProvider client={queryClient}>
						<Outlet />
						<Toaster richColors />

						{!import.meta.env.PROD && (
							<TanStackRouterDevtools position="bottom-right" />
						)}
						<Analytics />
						<SpeedInsights />
						<Scripts />
					</QueryClientProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
