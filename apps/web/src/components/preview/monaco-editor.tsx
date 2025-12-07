import Editor, { useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface MonacoEditorProps {
	code: string;
	onChange: (code: string) => void;
	language?: string;
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

			monaco.editor.defineTheme("tokyonight", {
				base: "vs-dark",
				inherit: true,
				rules: [
					{ token: "", foreground: "a9b1d6", background: "1a1b26" },
					{ token: "comment", foreground: "565f89", fontStyle: "italic" },
					{ token: "keyword", foreground: "bb9af7" },
					{ token: "string", foreground: "9ece6a" },
					{ token: "number", foreground: "ff9e64" },
					{ token: "type", foreground: "2ac3de" },
					{ token: "class", foreground: "7dcfff" },
					{ token: "function", foreground: "7aa2f7" },
					{ token: "tag", foreground: "f7768e" },
					{ token: "attribute.name", foreground: "bb9af7" },
					{ token: "attribute.value", foreground: "9ece6a" },
				],
				colors: {
					"editor.background": "#1a1b26",
					"editor.foreground": "#a9b1d6",
					"editorCursor.foreground": "#c0caf5",
					"editor.lineHighlightBackground": "#292e42",
					"editorLineNumber.foreground": "#565f89",
					"editor.selectionBackground": "#33467C",
					"editor.inactiveSelectionBackground": "#33467C80",
				},
			});
		}
	}, [monaco]);

	if (!mounted) {
		return <div className="h-full w-full bg-muted/30" />;
	}

	return (
		<div className="h-full w-full">
			<Editor
				height="100%"
				language={language}
				value={code}
				theme={resolvedTheme === "dark" ? "tokyonight" : "light"}
				onChange={(value) => onChange(value || "")}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					lineNumbers: "on",
					scrollBeyondLastLine: false,
					automaticLayout: true,
					padding: { top: 16, bottom: 16 },
					fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
				}}
			/>
		</div>
	);
}
