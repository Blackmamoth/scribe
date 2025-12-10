import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardChatPanel } from "@/components/dashboard/dashboard-chat-panel";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ChatPageSkeleton } from "@/components/skeletons/chat-page-skeleton";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getChat } from "@/functions/chat";
import { useScribeChat } from "@/hooks/chat";
import { sendTestEmail } from "@/lib/email-utils";

export const Route = createFileRoute("/chat/$id")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/signin" });
		}
		return { user: context.user };
	},
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
	const { id } = Route.useParams();

	const { user } = Route.useRouteContext();

	const {
		chatSession,
		isFetchingchatSession,
		isLoadingchatSession,
		latestEmailCode,
		isFetchingLatestEmail,
	} = useScribeChat(id);

	const [input, setInput] = useState("");
	const [isLoading, _setIsLoading] = useState(false);

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

	useEffect(() => {
		if (chatSession?.brandId) {
			setSelectedBrandId(chatSession.brandId);
		}

		if (chatSession?.preset) {
			setEmailPreset(chatSession.preset);
		}

		if (chatSession?.tone) {
			setTone(chatSession.tone);
		}
	}, [chatSession?.brandId, chatSession?.preset, chatSession?.tone]);

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
		if (!user?.email) {
			toast.error("User email not found");
			return;
		}

		if (!previewHtml) {
			toast.error("No preview content to send");
			return;
		}

		const toastId = toast.loading("Sending test email...");
		try {
			await sendTestEmail(previewHtml, user.email);
			toast.success(`Test email sent to ${user.email}`, { id: toastId });
		} catch (error) {
			console.error("Failed to send test email:", error);
			toast.error("Failed to send test email", { id: toastId });
		}
	};

	if (isLoadingchatSession) {
		return (
			<AuthenticatedLayout>
				<ChatPageSkeleton />
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout>
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
									isLoading={isLoading}
									chatId={id}
									setGeneratedCode={setGeneratedCode}
									input={input}
									setInput={setInput}
									selectedBrandId={selectedBrandId}
									setSelectedBrandId={setSelectedBrandId}
									tone={tone}
									setTone={setTone}
									emailPreset={emailPreset}
									setEmailPreset={setEmailPreset}
									chatMessages={chatSession?.chatMessages}
									isFetchingChatMessages={isFetchingchatSession}
								/>
							</ResizablePanel>

							<ResizableHandle />

							<ResizablePanel defaultSize={60} minSize={30}>
								<DashboardPreviewPanel
									viewMode={viewMode}
									setViewMode={setViewMode}
									device={device}
									setDevice={setDevice}
									generatedCode={generatedCode}
									setGeneratedCode={setGeneratedCode}
									onExportJsx={handleExportJsx}
									onSendTest={handleSendTest}
									previewTheme={previewTheme}
									setPreviewTheme={setPreviewTheme}
									latestEmailCode={latestEmailCode}
									isFetchingLatestEmail={isFetchingLatestEmail}
									previewHtml={previewHtml}
									onHtmlChange={setPreviewHtml}
								/>
							</ResizablePanel>
						</ResizablePanelGroup>
					</motion.div>
				</AnimatePresence>
			</div>
		</AuthenticatedLayout>
	);
}
