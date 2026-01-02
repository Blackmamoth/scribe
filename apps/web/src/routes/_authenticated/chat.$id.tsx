import { type UIMessage, useChat } from "@ai-sdk/react";
import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardChatPanel } from "@/components/dashboard/dashboard-chat-panel";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";
import { RollbackDialog } from "@/components/rollback-dialog";
import { ChatPageSkeleton } from "@/components/skeletons/chat-page-skeleton";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getChat } from "@/functions/chat";
import { sendTestEmail } from "@/functions/email";
import { useScribeChat } from "@/hooks/chat";
import { useEmailVersions } from "@/hooks/use-email-versions";

export const Route = createFileRoute("/_authenticated/chat/$id")({
	component: RouteComponent,
	loader: async ({ params }) => {
		try {
			const chat = await getChat({ data: { id: params.id } });
			return { chat };
		} catch (_error) {
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

	const { versions, rollback } = useEmailVersions(chatId);

	const [input, setInput] = useState("");
	const [_isLoading, _setIsLoading] = useState(false);

	const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
	const [pendingRollbackVersion, setPendingRollbackVersion] = useState<{
		versionId: string;
		version: number;
	} | null>(null);

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

	const [isAnimating, setIsAnimating] = useState(false);
	const [animatedCode, setAnimatedCode] = useState("");
	const animationRef = useRef<{ cancelled: boolean }>({ cancelled: false });

	const messageWithVersionMap = useMemo(() => {
		const map = new Map<string, boolean>();
		if (!chatSession?.chatMessages || versions.length === 0) {
			return map;
		}

		const messageIdsWithVersions = new Set(
			versions
				.map((v) => v.chatMessageId)
				.filter((id): id is string => id !== null),
		);

		chatSession.chatMessages.forEach((msg) => {
			map.set(msg.id, messageIdsWithVersions.has(msg.id));
		});

		return map;
	}, [chatSession?.chatMessages, versions]);

	const currentVersion = useMemo(() => {
		return versions.length > 0 ? versions[0].version : null;
	}, [versions]);

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
		if (chatSession?.chatMessages !== undefined && !isFetchingChatSession) {
			if (chatSession.chatMessages.length === 0) {
				const localStorageKey = `initial_prompt_${chatId}`;
				const initialPrompt = localStorage.getItem(localStorageKey);
				if (initialPrompt !== null && messages.length === 0) {
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
				} else if (messages.length > 0) {
					setMessages([]);
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
			if (error instanceof Error) {
				toast.error(error.message, { id: toastId });
			} else {
				toast.error("failed to send test email", { id: toastId });
			}
		}
	};

	const handleRollbackFromVersionSelector = (
		versionId: string,
		version: number,
	) => {
		setPendingRollbackVersion({ versionId, version });
		setRollbackDialogOpen(true);
	};

	const handleConfirmRollback = async () => {
		if (!pendingRollbackVersion) return;

		try {
			await rollback(pendingRollbackVersion.versionId);
			setRollbackDialogOpen(false);
			setPendingRollbackVersion(null);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			}
		}
	};

	const handleRollbackFromMessage = (messageId: string) => {
		const targetVersionData = versions.find(
			(v) => v.chatMessageId === messageId,
		);

		if (!targetVersionData) {
			toast.error("Unable to rollback", {
				description: "No email version exists for this message",
			});
			return;
		}

		setPendingRollbackVersion({
			versionId: targetVersionData.id,
			version: targetVersionData.version,
		});
		setRollbackDialogOpen(true);
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
								messageVersions={messageWithVersionMap}
								onRollbackFromMessage={handleRollbackFromMessage}
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
								versions={versions}
								currentVersion={currentVersion}
								onOpenRollbackDialog={handleRollbackFromVersionSelector}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</motion.div>
			</AnimatePresence>

			{pendingRollbackVersion && (
				<RollbackDialog
					open={rollbackDialogOpen}
					onOpenChange={setRollbackDialogOpen}
					onConfirm={handleConfirmRollback}
					targetVersion={pendingRollbackVersion.version}
					messageCountToDelete={
						versions.length > 0
							? versions[0].version - pendingRollbackVersion.version
							: 0
					}
				/>
			)}
		</div>
	);
}
