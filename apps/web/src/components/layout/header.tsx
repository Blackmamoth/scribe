import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function Header() {
	const { theme, setTheme } = useTheme();

	const { data } = authClient.useSession();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center justify-between">
				<div className="flex items-center gap-2">{/* Empty left side */}</div>
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "light" ? "dark" : "light")}
					>
						<Sun className="dark:-rotate-90 h-5 w-5 rotate-0 scale-100 transition-all dark:scale-0" />
						<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>

					{!data?.user && (
						<>
							{" "}
							<Button variant="ghost" asChild>
								<Link to="/signin">Sign In</Link>
							</Button>
							<Button asChild>
								<Link to="/signup">Get Started</Link>
							</Button>{" "}
						</>
					)}
				</div>
			</div>
		</header>
	);
}
