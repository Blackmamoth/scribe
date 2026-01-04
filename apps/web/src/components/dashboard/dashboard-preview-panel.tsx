import { useEffect, useMemo } from "react";
import { EmailPreview } from "@/components/preview/email-preview";
import { MonacoEditor } from "@/components/preview/monaco-editor";
import { PreviewHeader } from "@/components/preview/preview-header";
import type { EmailVersion } from "@/hooks/use-email-versions";
import { cn } from "@/lib/utils";

interface DashboardPreviewPanelProps {
	viewMode: "preview" | "code";
	setViewMode: (mode: "preview" | "code") => void;
	device: "desktop" | "tablet" | "mobile";
	setDevice: (device: "desktop" | "tablet" | "mobile") => void;
	generatedCode: string;
	setGeneratedCode: (code: string) => void;
	onExportJsx: () => void;
	onExportHtml: () => void;
	onSendTest: () => void;
	previewTheme: "light" | "dark";
	setPreviewTheme: (theme: "light" | "dark") => void;
	latestEmailCode: string | undefined;
	isFetchingLatestEmail: boolean;
	previewHtml: string;
	onHtmlChange: (html: string) => void;
	isStreaming: boolean;
	isAnimating: boolean;
	versions: EmailVersion[];
	selectedVersionId: string | null;
	onSelectVersion: (versionId: string | null) => void;
	onFixError: (error: string) => void;
}

export function DashboardPreviewPanel({
	viewMode,
	setViewMode,
	device,
	setDevice,
	generatedCode,
	setGeneratedCode,
	onExportJsx,
	onExportHtml,
	onSendTest,
	previewTheme,
	setPreviewTheme,
	latestEmailCode,
	isFetchingLatestEmail,
	previewHtml,
	onHtmlChange,
	isStreaming,
	isAnimating,
	versions,
	selectedVersionId,
	onSelectVersion,
	onFixError,
}: DashboardPreviewPanelProps) {
	const displayedCode = useMemo(() => {
		if (selectedVersionId) {
			const selectedVersion = versions.find((v) => v.id === selectedVersionId);
			return selectedVersion?.code || generatedCode;
		}
		return generatedCode;
	}, [selectedVersionId, versions, generatedCode]);

	useEffect(() => {
		if (!isFetchingLatestEmail && latestEmailCode && !selectedVersionId) {
			setGeneratedCode(latestEmailCode);
		}
	}, [
		isFetchingLatestEmail,
		setGeneratedCode,
		latestEmailCode,
		selectedVersionId,
	]);

	return (
		<div className="flex h-full flex-col border-l">
			<PreviewHeader
				viewMode={viewMode}
				setViewMode={setViewMode}
				device={device}
				setDevice={setDevice}
				onCopyHtml={() => navigator.clipboard.writeText(generatedCode)}
				onExportJsx={onExportJsx}
				onExportHtml={onExportHtml}
				onSendTest={onSendTest}
				previewTheme={previewTheme}
				setPreviewTheme={setPreviewTheme}
				versions={versions}
				selectedVersionId={selectedVersionId}
				onSelectVersion={onSelectVersion}
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
						code={displayedCode}
						device={device}
						previewTheme={previewTheme}
						previewHtml={previewHtml}
						onHtmlChange={onHtmlChange}
						isStreaming={isStreaming}
						onFixError={onFixError}
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
						code={displayedCode}
						onChange={setGeneratedCode}
						isStreaming={isStreaming}
						isAnimating={isAnimating}
					/>
				</div>
			</div>
		</div>
	);
}
