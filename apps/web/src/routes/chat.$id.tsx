import { createFileRoute, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardChatPanel } from "@/components/dashboard/dashboard-chat-panel";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { SendTestDialog } from "@/components/preview/send-test-dialog";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

export const Route = createFileRoute("/chat/$id")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/signin" });
		}
		return { user: context.user };
	},
});

function RouteComponent() {
	const { id } = Route.useParams();

	const [input, setInput] = useState("");
	const [isLoading, _setIsLoading] = useState(false);

	const [generatedCode, setGeneratedCode] = useState("");
	const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

	const [tone, setTone] = useState("default");
	const [emailPreset, setEmailPreset] = useState("");

	const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
	const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
		"desktop",
	);
	const [isSendTestOpen, setIsSendTestOpen] = useState(false);
	const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			// sendMessage(input);
		}
	};

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

	return (
		<AuthenticatedLayout>
			<div className="relative flex h-full flex-col">
				<SendTestDialog
					open={isSendTestOpen}
					onOpenChange={setIsSendTestOpen}
				/>
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
									onKeyDown={handleKeyDown}
									selectedBrandId={selectedBrandId}
									setSelectedBrandId={setSelectedBrandId}
									tone={tone}
									setTone={setTone}
									emailPreset={emailPreset}
									setEmailPreset={setEmailPreset}
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
									onSendTest={() => setIsSendTestOpen(true)}
									previewTheme={previewTheme}
									setPreviewTheme={setPreviewTheme}
								/>
							</ResizablePanel>
						</ResizablePanelGroup>
					</motion.div>
				</AnimatePresence>
			</div>
		</AuthenticatedLayout>
	);
}
