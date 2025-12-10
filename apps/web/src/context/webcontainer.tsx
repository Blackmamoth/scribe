import { WebContainer } from "@webcontainer/api";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

type BootStatus = "idle" | "booting" | "installing" | "ready" | "error";

interface WebContainerContextValue {
	wc: WebContainer | null;
	bootStatus: BootStatus;
	error: string | null;
	writeFile: (path: string, content: string) => Promise<void>;
	runNode: (args: string[]) => Promise<{ output: string; exitCode: number }>;
}

const WebContainerContext = createContext<WebContainerContextValue | null>(
	null,
);

export function WebContainerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const wcRef = useRef<WebContainer | null>(null);
	const [bootStatus, setBootStatus] = useState<BootStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	const writeFile = useCallback(async (path: string, content: string) => {
		if (!wcRef.current) throw new Error("WebContainer not ready");
		await wcRef.current.fs.writeFile(path, content);
	}, []);

	const runNode = useCallback(async (args: string[]) => {
		const wc = wcRef.current;
		if (!wc) throw new Error("WebContainer not ready");

		const proc = await wc.spawn("node", args);

		let output = "";
		proc.output?.pipeTo(
			new WritableStream({
				write(data) {
					output += data;
				},
			}),
		);

		const exitCode = await proc.exit;

		return { output, exitCode };
	}, []);

	const installDeps = useCallback(async () => {
		const wc = wcRef.current;
		if (!wc) return;
		const install = await wc.spawn("npm", ["install"]);
		const exitCode = await install.exit;
		if (exitCode !== 0) throw new Error("Failed to install dependencies");
	}, []);

	useEffect(() => {
		if (wcRef.current) return;

		async function boot() {
			try {
				setBootStatus("booting");
				// Use a global variable on window to strictly ensure singleton across HMR/remounts
				// @ts-expect-error
				if (!window.webContainerPromise) {
					// @ts-expect-error
					window.webContainerPromise = WebContainer.boot();
				}
				// @ts-expect-error
				const wc = await window.webContainerPromise;
				wcRef.current = wc;

				await wc.fs.writeFile(
					"package.json",
					JSON.stringify(
						{
							name: "email-preview",
							type: "module",
							dependencies: {
								react: "19.2.0",
								"react-dom": "19.2.0",
								"react-email": "5.0.5",
								"@react-email/components": "1.0.1",
								"@react-email/render": "2.0.0",
							},
							devDependencies: {
								esbuild: "0.27.1",
								typescript: "5",
							},
						},
						null,
						2,
					),
				);

				await wc.fs.writeFile(
					"tsconfig.json",
					JSON.stringify(
						{
							compilerOptions: {
								target: "ESNext",
								module: "ESNext",
								jsx: "react-jsx",
								moduleResolution: "Node",
							},
						},
						null,
						2,
					),
				);

				await wc.fs.writeFile(
					"render.js",
					`
          import React from "react";
          import { render } from "@react-email/render";
          import Email from "./index.js";

          async function main() {
            const html = await render(React.createElement(Email), { pretty: true });
            console.log(html);
          }

          main();
        `,
				);

				await wc.fs.writeFile(
					"build.js",
					`
          import esbuild from "esbuild";

          await esbuild.build({
            entryPoints: ["index.tsx"],
            outfile: "index.js",
            bundle: true,
            format: "esm",
            platform: "browser",
            jsx: "transform",
          });
        `,
				);

				setBootStatus("installing");
				await installDeps();

				setBootStatus("ready");
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
				setBootStatus("error");
			}
		}

		boot();
	}, [installDeps]);

	return (
		<WebContainerContext.Provider
			value={{
				wc: wcRef.current,
				bootStatus,
				error,
				writeFile,
				runNode,
			}}
		>
			{children}
		</WebContainerContext.Provider>
	);
}

export function useWebContainerContext() {
	return useContext(WebContainerContext);
}
