import { Link } from "@tanstack/react-router";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
	return (
		<div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
			<div className="mb-4 rounded-full bg-muted p-4">
				<Ghost className="h-12 w-12 text-muted-foreground" />
			</div>
			<h1 className="mb-2 font-bold text-4xl tracking-tight">
				404: Nothing to see here
			</h1>
			<p className="mb-8 max-w-[500px] text-lg text-muted-foreground">
				Congratulations! You've found a completely empty page. We're very proud
				of it, but it's probably not what you were looking for.
			</p>
			<Button asChild size="lg">
				<Link to="/">Take me back to safety</Link>
			</Button>
		</div>
	);
}
