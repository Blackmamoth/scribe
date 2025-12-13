import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

interface ResetPasswordFormProps {
	email: string;
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [otp, setOtp] = useState("");

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: resetPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			if (otp.length !== 6) {
				toast.error("Please enter a valid 6-digit code");
				return;
			}

			setIsLoading(true);

			const { error } = await authClient.emailOtp.resetPassword({
				email,
				otp,
				password: value.password,
			});

			if (error) {
				toast.error(error.message || "Failed to reset password");
				setIsLoading(false);
				return;
			}

			toast.success("Password reset successfully!");
			setIsLoading(false);
			navigate({ to: "/signin" });
		},
	});

	const handleResend = async () => {
		await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "forget-password",
		});
		toast.success("Verification code resent to your email");
	};

	return (
		<div className="w-full max-w-md space-y-4">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Reset password</CardTitle>
					<CardDescription>
						Enter the code sent to {email} and your new password
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col items-center space-y-4">
						<Label>Verification Code</Label>
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
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field
							name="password"
							validators={{
								onChange: resetPasswordSchema.shape.password,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="password">New Password</Label>
									<Input
										id="password"
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors && field.state.meta.isTouched && (
										<p className="text-red-500 text-sm">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="confirmPassword"
							validators={{
								onChange: resetPasswordSchema.shape.confirmPassword,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors && field.state.meta.isTouched && (
										<p className="text-red-500 text-sm">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<Button
							disabled={
								isLoading || !form.state.isFormValid || otp.length !== 6
							}
							type="submit"
							className="w-full"
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Reset Password
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
