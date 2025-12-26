import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandSelector } from "@/components/brands/brand-selector";
import { ChatOptions } from "@/components/chat/chat-options";
import { Textarea } from "@/components/ui/textarea";
import { useScribeChat } from "@/hooks/chat";
import { authClient } from "@/lib/auth-client";

export function Hero() {
	const [input, setInput] = useState("");
	const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
	const [tone, setTone] = useState<EmailTone>("professional");
	const [emailPreset, setEmailPreset] = useState<EmailPreset>("cold_email");

	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

	const navigate = useNavigate();

	const { createChat, isCreating } = useScribeChat();

	const handleSendMessage = async () => {
		if (!isAuthenticated) {
			const { data: signInData } = await authClient.signIn.anonymous();
			if (signInData?.user) {
				toast.success("You're signed in as a guest");
			}
		}
		if (input.trim()) {
			const id = await createChat({
				prompt: input,
				brandId: selectedBrandId,
				tone,
				preset: emailPreset,
			});
			localStorage.setItem(`initial_prompt_${id}`, input);
			navigate({ to: "/chat/$id", params: { id } });
		}
	};

	return (
		<section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-24 md:py-32">
			<div className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="container flex max-w-4xl flex-col items-center text-center"
			>
				<div className="mb-8 inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm backdrop-blur-sm">
					<Sparkles className="mr-2 h-4 w-4 text-primary" />
					<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-medium text-transparent">
						AI-Powered Email Generator
					</span>
				</div>

				<h1 className="mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-6xl md:text-7xl">
					Create beautiful emails <br /> in seconds
				</h1>

				<p className="mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl">
					Describe your email, and Scribe will generate a responsive,
					customizable template instantly. No coding required.
				</p>

				<div className="w-full max-w-xl">
					<div className="relative flex flex-col gap-2">
						<div className="relative flex w-full flex-col rounded-xl border bg-background p-2 shadow-sm ring-1 ring-border transition-all focus-within:ring-2 focus-within:ring-primary/30">
							<Textarea
								placeholder="Describe the email you want to build..."
								className="min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0"
								value={input}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setInput(e.target.value)
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
								disabled={isCreating}
							/>
							<div className="mt-2 flex items-center justify-between px-3 pb-3">
								<div className="flex items-center gap-2">
									{isAuthenticated && (
										<BrandSelector
											value={selectedBrandId}
											onChange={setSelectedBrandId}
										/>
									)}
									{setTone && setEmailPreset && (
										<ChatOptions
											tone={tone}
											setTone={setTone}
											emailPreset={emailPreset}
											setEmailPreset={setEmailPreset}
										/>
									)}
								</div>
								<div className="flex items-center gap-4">
									<div className="hidden text-muted-foreground text-xs sm:block">
										Press{" "}
										<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
											Enter
										</kbd>{" "}
										to send
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6 flex flex-wrap justify-center gap-2 text-muted-foreground text-sm">
						<span className="font-medium text-foreground">Try:</span>
						<button
							type="button"
							onClick={() => setInput("Welcome email for SaaS product")}
							className="transition-colors hover:text-primary"
						>
							Welcome email
						</button>
						<span>•</span>
						<button
							type="button"
							onClick={() => setInput("Monthly newsletter with 3 articles")}
							className="transition-colors hover:text-primary"
						>
							Newsletter
						</button>
						<span>•</span>
						<button
							type="button"
							onClick={() => setInput("Password reset notification")}
							className="transition-colors hover:text-primary"
						>
							Password reset
						</button>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
