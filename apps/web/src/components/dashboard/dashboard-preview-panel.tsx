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
						html={generatedCode}
						device={device}
						previewTheme={previewTheme}
					/>
				</div>

				<div
					className={cn(
						"absolute inset-0",
						viewMode !== "code" && "pointer-events-none opacity-0",
						viewMode === "code" && "opacity-100",
					)}
				>
					<MonacoEditor code={generatedCode} onChange={setGeneratedCode} />
				</div>
			</div>
		</div>
	);
}
