import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SendTestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SendTestDialog({ open, onOpenChange }: SendTestDialogProps) {
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);

	const handleSend = async () => {
		if (!email) return;

		setIsSending(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsSending(false);
		onOpenChange(false);
		toast.success(`Test email sent to ${email}!`);
		setEmail("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Send Test Email</DialogTitle>
					<DialogDescription>
						Enter an email address to send a test preview of your template.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSend} disabled={isSending || !email}>
						{isSending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<Send className="mr-2 h-4 w-4" />
								Send Test
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
