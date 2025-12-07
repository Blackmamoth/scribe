import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
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
import SocialLogin from "./social-login";

const signinSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export function SigninForm() {
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: signinSchema,
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);

			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					callbackURL: "/",
				},
				{
					onSuccess: () => {
						setIsLoading(false);
						toast.success("Signed in successfully!");
					},
					onError: async (ctx) => {
						setIsLoading(false);
						if (ctx.error.message === "Email not verified") {
							const { error } = await authClient.emailOtp.sendVerificationOtp({
								email: value.email,
								type: "sign-in",
							});

							if (error !== null) {
								toast.error(
									error.message ||
										"An error occured while sending verification code, please try again!",
								);
							}

							navigate({ to: "/verify-email", search: { email: value.email } });
						} else {
							toast.error(ctx.error.message);
						}
					},
				},
			);
		},
	});

	return (
		<div className="w-full max-w-md space-y-4">
			<Button
				variant="ghost"
				size="sm"
				className="gap-2"
				onClick={() => navigate({ to: "/" })}
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</Button>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account to continue</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
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
								onChange: signinSchema.shape.email,
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

						<form.Field
							name="password"
							validators={{
								onChange: signinSchema.shape.password,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="password">Password</Label>
										<Link
											to="."
											className="text-primary text-sm hover:underline"
										>
											Forgot password?
										</Link>
									</div>
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

						<Button
							disabled={isLoading || !form.state.isFormValid}
							type="submit"
							className="w-full"
						>
							Sign in
						</Button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<SocialLogin />

					<p className="text-center text-muted-foreground text-sm">
						Don't have an account?{" "}
						<Link to="/signup" className="text-primary hover:underline">
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
