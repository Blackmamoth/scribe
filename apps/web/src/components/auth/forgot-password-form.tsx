import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
	email: z.email("Invalid email address"),
});

export function ForgotPasswordForm() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onChange: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);

			const { error } = await authClient.forgetPassword.emailOtp({
				email: value.email,
			});

			if (error) {
				toast.error(
					error.message || "Something went wrong so please try again",
				);
				setIsLoading(false);
				return;
			}

			toast.success("Password reset link sent to your email");
			setIsLoading(false);
			navigate({ to: "/reset-password", search: { email: value.email } });
		},
	});

	return (
		<div className="w-full max-w-md space-y-4">
			<Button
				variant="ghost"
				size="sm"
				className="gap-2"
				onClick={() => navigate({ to: "/signin" })}
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Sign in
			</Button>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Forgot password</CardTitle>
					<CardDescription>
						Enter your email address and we will send you a verification code
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field
							name="email"
							validators={{
								onChange: forgotPasswordSchema.shape.email,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="name@example.com"
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
							disabled={isLoading || !form.state.isFormValid}
							type="submit"
							className="w-full"
						>
							Send Verification Code
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
