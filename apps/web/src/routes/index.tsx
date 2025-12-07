import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Hero } from "@/components/landing/hero";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Header } from "@/components/layout/header";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const { user } = Route.useRouteContext();

	if (!user) {
		return (
			<div className="flex min-h-screen flex-col bg-background font-sans antialiased">
				<Header />
				<main className="flex-1">
					<Hero isAuthenticated={false} />
				</main>
			</div>
		);
	}

	return (
		<AuthenticatedLayout>
			<div className="relative flex h-full flex-col">
				<AnimatePresence mode="wait">
					<motion.div
						key="hero"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center"
					>
						<Hero isAuthenticated={true} />
					</motion.div>
				</AnimatePresence>
			</div>
		</AuthenticatedLayout>
	);
}
