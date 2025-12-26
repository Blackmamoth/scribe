import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

interface SearchParams {
	email: string;
}

export const Route = createFileRoute("/verify-email")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			email: (search.email as string) || "",
		};
	},
});

function RouteComponent() {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const { email } = Route.useSearch();

	const handleVerify = async () => {
		if (otp.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		setIsLoading(true);

		const { error } = await authClient.emailOtp.verifyEmail({
			email,
			otp,
		});

		if (error !== null) {
			toast.error(
				error.message || "Email verification failed, please try again!",
			);
			return;
		}

		setIsLoading(false);

		toast.success("Email verified successfully!");
		navigate({ to: "/" });
	};

	const handleResend = async () => {
		await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "email-verification",
		});
		toast.success("Verification code resent to your email");
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mb-4 flex justify-center">
						<div className="rounded-full bg-primary/10 p-3 text-primary">
							<Mail className="h-6 w-6" />
						</div>
					</div>
					<CardTitle className="font-bold text-2xl">Check your email</CardTitle>
					<CardDescription>
						We've sent a 6-digit verification code to your email address.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center space-y-6">
					<InputOTP
						maxLength={6}
						value={otp}
						onChange={(value) => setOtp(value)}
						disabled={isLoading}
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
					<div className="text-muted-foreground text-sm">
						Didn't receive the code?{" "}
						<button
							type="button"
							onClick={handleResend}
							className="font-medium text-primary hover:underline"
							disabled={isLoading}
						>
							Resend
						</button>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						className="w-full"
						onClick={handleVerify}
						disabled={isLoading || otp.length !== 6}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Verify Email
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
