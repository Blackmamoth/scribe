import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEmailCompiler } from "@/hooks/email-compiler";
import { cn } from "@/lib/utils";

function injectPreviewStyles(html: string): string {
	if (!html) return html;

	const baseTag = `<base target="_blank" rel="noopener noreferrer">`;

	if (html.includes("<head>")) {
		return html.replace("<head>", `<head>${baseTag}`);
	}
	if (html.includes("<html")) {
		return html.replace(/<html[^>]*>/, `$&<head>${baseTag}</head>`);
	}
	return baseTag + html;
}

interface EmailPreviewProps {
	code: string;
	device: "desktop" | "tablet" | "mobile";
	previewTheme: "light" | "dark";
	previewHtml: string;
	onHtmlChange: (html: string) => void;
	isStreaming: boolean;
}

export function EmailPreview({
	code,
	device,
	previewTheme,
	previewHtml,
	onHtmlChange,
	isStreaming,
}: EmailPreviewProps) {
	const [error, setError] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	const { status, compileAndRender } = useEmailCompiler();

	const width = {
		desktop: "100%",
		tablet: "768px",
		mobile: "375px",
	}[device];

	const generatePreview = useCallback(
		async (code: string) => {
			if (status !== "ready") return;
			if (isStreaming) return;
			try {
				setIsGenerating(true);

				const result = await compileAndRender(code);

				if (result.error) {
					setError(result.error);
				} else {
					onHtmlChange(result.html);
					setError(null);
				}
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
			} finally {
				setIsGenerating(false);
			}
		},
		[status, compileAndRender, onHtmlChange, isStreaming],
	);

	useEffect(() => {
		if (!code || status !== "ready") return;

		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			generatePreview(code);
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [code, status, generatePreview]);

	const safePreviewHtml = useMemo(
		() => injectPreviewStyles(previewHtml),
		[previewHtml],
	);

	return (
		<div className="flex h-full flex-1 items-center justify-center overflow-hidden bg-muted/30 p-4">
			<div
				className={cn(
					"relative h-full border bg-white shadow-sm transition-all duration-300 ease-in-out",
					device !== "desktop" && "h-[90%] rounded-lg",
					previewTheme === "dark" && "bg-gray-900",
				)}
				style={{ width }}
			>
				{isGenerating && (
					<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-sm">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="animate-pulse font-medium text-muted-foreground text-sm">
							Generating preview...
						</p>
					</div>
				)}

				{error ? (
					<div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4 text-red-500">
						<div className="max-w-md">
							<p className="mb-2 font-medium">Preview Error</p>
							<p className="whitespace-pre-wrap font-mono text-xs">{error}</p>
						</div>
					</div>
				) : (
					<iframe
						srcDoc={safePreviewHtml}
						className="h-full w-full border-0"
						title="Email Preview"
						sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
					/>
				)}
			</div>
		</div>
	);
}
