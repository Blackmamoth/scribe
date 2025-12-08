import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebContainer } from "@/hooks/webcontainer";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
	html: string;
	device: "desktop" | "tablet" | "mobile";
	previewTheme: "light" | "dark";
}

export function EmailPreview({
	html: code,
	device,
	previewTheme,
}: EmailPreviewProps) {
	const [previewHtml, setPreviewHtml] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	const {
		bootStatus,
		writeFile,
		runNode,
		error: bootError,
	} = useWebContainer();

	const width = {
		desktop: "100%",
		tablet: "768px",
		mobile: "375px",
	}[device];

	const generatePreview = useCallback(
		async (code: string) => {
			if (bootStatus !== "ready") return;

			try {
				setIsGenerating(true);

				// update user code
				await writeFile("index.tsx", code);

				// build -> index.js
				await runNode(["build.js"]);

				// run render.ts
				const result = await runNode(["render.js"]);

				if (result.exitCode === 0) {
					setPreviewHtml(result.output);
					setError(null);
				} else {
					setError(result.output);
				}
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
			} finally {
				setIsGenerating(false);
			}
		},
		[bootStatus, runNode, writeFile],
	);

	useEffect(() => {
		if (!code || bootStatus !== "ready") return;

		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			generatePreview(code);
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [code, bootStatus, generatePreview]);

	const bootMessage = {
		idle: null,
		booting: "Booting WebContainer...",
		installing: "Installing dependencies...",
		ready: null,
		error: "Failed to initialize preview environment",
	} as const;

	const isBooting = bootStatus !== "ready";
	const message =
		bootMessage[bootStatus] ?? (isGenerating ? "Generating preview..." : null);

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
				{(isBooting || isGenerating) && (
					<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-sm">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						{message && (
							<p className="animate-pulse font-medium text-muted-foreground text-sm">
								{message}
							</p>
						)}
					</div>
				)}

				{bootError || error ? (
					<div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4 text-red-500">
						<div className="max-w-md">
							<p className="mb-2 font-medium">Preview Error</p>
							<p className="whitespace-pre-wrap font-mono text-xs">
								{bootError || error}
							</p>
						</div>
					</div>
				) : (
					<iframe
						srcDoc={previewHtml}
						className="h-full w-full border-0"
						title="Email Preview"
						sandbox="allow-scripts"
					/>
				)}
			</div>
		</div>
	);
}
