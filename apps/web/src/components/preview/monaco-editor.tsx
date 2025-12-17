import Editor, { useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface MonacoEditorProps {
	code: string;
	onChange: (code: string) => void;
	language?: string;
	isStreaming?: boolean;
}

export function MonacoEditor({
	code,
	onChange,
	language = "typescriptreact",
}: MonacoEditorProps) {
	const { theme, systemTheme } = useTheme();
	const monaco = useMonaco();
	const [mounted, setMounted] = useState(false);

	// Get the actual theme (resolving 'system' to actual theme)
	const resolvedTheme = theme === "system" ? systemTheme : theme;

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (monaco) {
			monaco.typescript.typescriptDefaults.setCompilerOptions({
				jsx: monaco.typescript.JsxEmit.ReactJSX,
				target: monaco.typescript.ScriptTarget.ESNext,
				module: monaco.typescript.ModuleKind.ESNext,
				allowNonTsExtensions: true,
				allowJs: true,
				moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
				resolveJsonModule: true,
				noEmit: true,
			});
		}
	}, [monaco]);

	if (!mounted) {
		return <div className="h-full w-full bg-muted/30" />;
	}

	return (
		<div className="relative h-full w-full">
			<Editor
				height="100%"
				language={language}
				value={code}
				theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
				onChange={(value) => onChange(value || "")}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					lineNumbers: "on",
					scrollBeyondLastLine: false,
					automaticLayout: true,
					padding: { top: 16, bottom: 16 },
					fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
					readOnly: true,
				}}
			/>
		</div>
	);
}
