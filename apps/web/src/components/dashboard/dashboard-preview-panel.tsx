import { useEffect } from "react";
import { EmailPreview } from "@/components/preview/email-preview";
import { MonacoEditor } from "@/components/preview/monaco-editor";
import { PreviewHeader } from "@/components/preview/preview-header";
import { cn } from "@/lib/utils";

interface DashboardPreviewPanelProps {
	viewMode: "preview" | "code";
	setViewMode: (mode: "preview" | "code") => void;
	device: "desktop" | "tablet" | "mobile";
	setDevice: (device: "desktop" | "tablet" | "mobile") => void;
	generatedCode: string;
	setGeneratedCode: (code: string) => void;
	onExportJsx: () => void;
	onSendTest: () => void;
	previewTheme: "light" | "dark";
	setPreviewTheme: (theme: "light" | "dark") => void;
	latestEmailCode: string | undefined;
	isFetchingLatestEmail: boolean;
	previewHtml: string;
	onHtmlChange: (html: string) => void;
	isStreaming?: boolean;
}

export function DashboardPreviewPanel({
	viewMode,
	setViewMode,
	device,
	setDevice,
	generatedCode,
	setGeneratedCode,
	onExportJsx,
	onSendTest,
	previewTheme,
	setPreviewTheme,
	latestEmailCode,
	isFetchingLatestEmail,
	previewHtml,
	onHtmlChange,
	isStreaming,
}: DashboardPreviewPanelProps) {
	useEffect(() => {
		if (!isFetchingLatestEmail && latestEmailCode) {
			setGeneratedCode(latestEmailCode);
		}
	}, [isFetchingLatestEmail, setGeneratedCode, latestEmailCode]);

	return (
		<div className="flex h-full flex-col border-l">
			<PreviewHeader
				viewMode={viewMode}
				setViewMode={setViewMode}
				device={device}
				setDevice={setDevice}
				onCopyHtml={() => navigator.clipboard.writeText(generatedCode)}
				onExportJsx={onExportJsx}
				onSendTest={onSendTest}
				previewTheme={previewTheme}
				setPreviewTheme={setPreviewTheme}
			/>
			<div className="relative flex-1 overflow-hidden">
				<div
					className={cn(
						"absolute inset-0",
						viewMode !== "preview" && "pointer-events-none opacity-0",
						viewMode === "preview" && "opacity-100",
					)}
				>
					<EmailPreview
						code={generatedCode}
						device={device}
						previewTheme={previewTheme}
						previewHtml={previewHtml}
						onHtmlChange={onHtmlChange}
					/>
					{isStreaming && (
						<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
							<div className="flex flex-col items-center gap-2">
								<span className="animate-spin text-3xl">⏳</span>
								<span className="font-medium text-sm">
									Streaming Response...
								</span>
							</div>
						</div>
					)}
				</div>

				<div
					className={cn(
						"absolute inset-0",
						viewMode !== "code" && "pointer-events-none opacity-0",
						viewMode === "code" && "opacity-100",
					)}
				>
					<MonacoEditor
						code={generatedCode}
						onChange={setGeneratedCode}
						isStreaming={isStreaming}
					/>
				</div>
			</div>
		</div>
	);
}
