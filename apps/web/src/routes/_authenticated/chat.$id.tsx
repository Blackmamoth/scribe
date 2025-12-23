import { type UIMessage, useChat } from "@ai-sdk/react";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardChatPanel } from "@/components/dashboard/dashboard-chat-panel";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";
import { ChatPageSkeleton } from "@/components/skeletons/chat-page-skeleton";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getChat } from "@/functions/chat";
import { sendTestEmail } from "@/functions/email";
import { useScribeChat } from "@/hooks/chat";

export const Route = createFileRoute("/_authenticated/chat/$id")({
	component: RouteComponent,
	loader: async ({ params }) => {
		try {
			const chat = await getChat({ data: { id: params.id } });
			if (!chat) {
				throw notFound();
			}
			return { chat };
		} catch (error) {
			console.error(error);
			throw notFound();
		}
	},
});

function RouteComponent() {
	const { id: chatId } = Route.useParams();

	const { user } = Route.useRouteContext();

	const {
		chatSession,
		isFetchingChatSession,
		isLoadingChatSession,
		latestEmailCode,
		isFetchingLatestEmail,
	} = useScribeChat(chatId);

	const [input, setInput] = useState("");
	const [_isLoading, _setIsLoading] = useState(false);

	const [generatedCode, setGeneratedCode] = useState("");
	const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

	const [tone, setTone] = useState<EmailTone>("professional");
	const [emailPreset, setEmailPreset] = useState<EmailPreset>("announcement");

	const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
	const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
		"desktop",
	);
	const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
	const [previewHtml, setPreviewHtml] = useState("");

	// Typewriter animation state
	const [isAnimating, setIsAnimating] = useState(false);
	const [animatedCode, setAnimatedCode] = useState("");
	const animationRef = useRef<{ cancelled: boolean }>({ cancelled: false });

	// Callback for when code is patched (diff applied) - triggers typewriter animation
	const handleCodePatched = useCallback(
		(oldText: string, newText: string) => {
			// Cancel any running animation
			animationRef.current.cancelled = true;
			animationRef.current = { cancelled: false };
			const currentAnimation = animationRef.current;

			// Get current code and find where the change is
			const codeBeforeChange = generatedCode;
			const changeIndex = codeBeforeChange.indexOf(oldText);

			if (changeIndex === -1) {
				// Couldn't find the change location, skip animation
				return;
			}

			const prefix = codeBeforeChange.slice(0, changeIndex);
			const suffix = codeBeforeChange.slice(changeIndex + oldText.length);

			setIsAnimating(true);
			setAnimatedCode(codeBeforeChange);

			let currentOldIndex = oldText.length;
			let currentNewIndex = 0;

			// Phase 1: Erase the old text character by character
			const eraseInterval = setInterval(() => {
				if (currentAnimation.cancelled) {
					clearInterval(eraseInterval);
					return;
				}

				if (currentOldIndex > 0) {
					currentOldIndex--;
					const partialOld = oldText.slice(0, currentOldIndex);
					setAnimatedCode(prefix + partialOld + suffix);
				} else {
					clearInterval(eraseInterval);

					// Phase 2: Type the new text character by character
					const typeInterval = setInterval(() => {
						if (currentAnimation.cancelled) {
							clearInterval(typeInterval);
							return;
						}

						if (currentNewIndex < newText.length) {
							currentNewIndex++;
							const partialNew = newText.slice(0, currentNewIndex);
							setAnimatedCode(prefix + partialNew + suffix);
						} else {
							clearInterval(typeInterval);
							setIsAnimating(false);
						}
					}, 10); // Type speed
				}
			}, 15); // Erase speed
		},
		[generatedCode],
	);

	// Cleanup animation on unmount
	useEffect(() => {
		return () => {
			animationRef.current.cancelled = true;
		};
	}, []);

	const { messages, setMessages, sendMessage, status, stop } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: {
				chatId,
				brandId: selectedBrandId,
				emailTone: tone,
				emailPreset: emailPreset,
			},
		}),
		id: chatId,
	});

	useEffect(() => {
		setSelectedBrandId(chatSession?.brandId ?? null);
		setEmailPreset(chatSession?.preset ?? "announcement");
		setTone(chatSession?.tone ?? "professional");
	}, [
		chatSession?.brandId,
		chatSession?.preset,
		chatSession?.tone,
		chatSession,
	]);

	useEffect(() => {
		if (
			chatSession?.chatMessages !== undefined &&
			!isFetchingChatSession &&
			messages.length === 0
		) {
			if (chatSession.chatMessages.length === 0) {
				const localStorageKey = `initial_prompt_${chatId}`;
				const initialPrompt = localStorage.getItem(localStorageKey);
				if (initialPrompt !== null) {
					sendMessage(
						{ text: initialPrompt },
						{
							body: {
								chatId,
								brandId: chatSession?.brandId,
								emailTone: chatSession?.tone,
								emailPreset: chatSession?.preset,
							},
						},
					);
					localStorage.removeItem(localStorageKey);
				}
			} else {
				setMessages(
					chatSession.chatMessages.map(
						(msg): UIMessage => ({
							id: msg.id,
							parts: [{ type: "text", text: msg.message }],
							role: msg.role === "user" ? "user" : "assistant",
						}),
					),
				);
			}
		}
	}, [
		chatSession?.chatMessages,
		isFetchingChatSession,
		sendMessage,
		setMessages,
		chatId,
		messages.length,
		chatSession?.brandId,
		chatSession?.preset,
		chatSession?.tone,
	]);

	const handleExportJsx = () => {
		const blob = new Blob([generatedCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "email-template.tsx";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("Exported as email-template.tsx");
	};

	const handleSendTest = async () => {
		const toastId = toast.loading("Sending test email...");
		try {
			await sendTestEmail({ data: { id: chatId } });
			toast.success(`Test email sent to ${user.email}`, { id: toastId });
		} catch (error) {
			console.error("Failed to send test email:", error);
			toast.error("Failed to send test email", { id: toastId });
		}
	};

	if (isLoadingChatSession) {
		return <ChatPageSkeleton />;
	}

	return (
		<div className="relative flex h-full flex-col">
			<AnimatePresence mode="wait">
				<motion.div
					key="chat"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="h-full"
				>
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full items-stretch"
					>
						<ResizablePanel defaultSize={40} minSize={30}>
							<DashboardChatPanel
								key={chatId}
								chatId={chatId}
								generatedCode={generatedCode}
								setGeneratedCode={setGeneratedCode}
								onCodePatched={handleCodePatched}
								input={input}
								setInput={setInput}
								selectedBrandId={selectedBrandId}
								setSelectedBrandId={setSelectedBrandId}
								tone={tone}
								setTone={setTone}
								emailPreset={emailPreset}
								setEmailPreset={setEmailPreset}
								messages={messages}
								sendMessage={sendMessage}
								status={status}
								stop={stop}
								user={user}
							/>
						</ResizablePanel>

						<ResizableHandle />

						<ResizablePanel defaultSize={60} minSize={30}>
							<DashboardPreviewPanel
								viewMode={viewMode}
								setViewMode={setViewMode}
								device={device}
								setDevice={setDevice}
								generatedCode={isAnimating ? animatedCode : generatedCode}
								setGeneratedCode={setGeneratedCode}
								onExportJsx={handleExportJsx}
								onSendTest={handleSendTest}
								previewTheme={previewTheme}
								setPreviewTheme={setPreviewTheme}
								latestEmailCode={latestEmailCode}
								isFetchingLatestEmail={isFetchingLatestEmail}
								previewHtml={previewHtml}
								onHtmlChange={setPreviewHtml}
								isStreaming={status === "streaming"}
								isAnimating={isAnimating}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
