import crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "@react-email/render";
import { build } from "esbuild";
import type { ReactElement } from "react";

interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

interface ComponentProps {
	[key: string]: unknown;
}

export class JSXTransformer {
	private validateJSXString(jsxString: string): ValidationResult {
		const errors: string[] = [];

		// Dangerous patterns that should not be allowed in UI components
		const dangerousPatterns = [
			{
				pattern: /\b(?:fs|require\(['"]fs['"]|import\s+.*fs\b)/,
				message: "File system operations are not allowed",
			},
			{
				pattern: /\b(?:process\.env|process\.[a-zA-Z])/,
				message: "Process access is not allowed",
			},
			{
				pattern: /\b(?:eval\(|Function\s*\()/,
				message: "Dynamic code execution is not allowed",
			},
			{
				pattern:
					/\bfetch\s*\(|XMLHttpRequest|axios\.(get|post|put|delete)|http\.(get|post|put|delete)/,
				message: "Network requests are not allowed",
			},
			{
				pattern: /\b(?:require\(['"]child_process|import\s+.*child_process\b)/,
				message: "Child process operations are not allowed",
			},
			{
				pattern: /\b(?:require\(['"]net|import\s+.*net\b)/,
				message: "Network module access is not allowed",
			},
			{
				pattern: /\b(?:require\(['"]os|import\s+.*os\b)/,
				message: "OS module access is not allowed",
			},
			{
				pattern: /\b(?:require\(['"]path|import\s+.*path\b)/,
				message: "Path operations are not allowed",
			},
			{
				pattern: /\b(?:setTimeout|setInterval)\s*\([^,]*,\s*[0-9]/,
				message: "Timer operations are not allowed",
			},
			{
				pattern: /\b(?:console\.(log|error|warn|info|debug))\s*\(/,
				message: "Console operations should be avoided in email components",
			},
			{
				pattern: /\b(?:document\.|window\.|global\.)/,
				message: "Browser DOM access is not allowed in email components",
			},
		];

		for (const { pattern, message } of dangerousPatterns) {
			if (pattern.test(jsxString)) {
				errors.push(message);
			}
		}

		const dangerousImports = [
			"fs",
			"path",
			"os",
			"child_process",
			"net",
			"http",
			"https",
			"url",
			"crypto",
			"cluster",
			"dgram",
			"dns",
			"readline",
			"repl",
			"timers",
			"tty",
			"util",
			"v8",
			"vm",
			"worker_threads",
			"zlib",
		];

		for (const module of dangerousImports) {
			const importPattern = new RegExp(
				`(?:import\\s+.*from\\s+['"]${module}['"]|require\\s*\\(\\s*['"]${module}['"])`,
			);
			if (importPattern.test(jsxString)) {
				errors.push(`Import of dangerous module '${module}' is not allowed`);
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	private async transformToModule(jsxString: string): Promise<string> {
		const result = await build({
			stdin: {
				contents: jsxString,
				loader: "tsx",
			},
			bundle: true,
			write: false,
			format: "cjs",
			platform: "node",
			jsx: "automatic",
			target: "es2022",
			minify: false,
			sourcemap: false,
			treeShaking: false,
			external: ["react", "react/jsx-runtime", "@react-email/components"],
			packages: "external",
		});

		return result.outputFiles[0]?.text || "";
	}

	private async createComponentFromModule(
		moduleCode: string,
		props: ComponentProps = {},
	): Promise<ReactElement> {
		const vm = await import("node:vm");

		const moduleExports: Record<string, unknown> = {};
		const moduleObject = { exports: moduleExports };

		const moduleCache: Record<string, unknown> = {};
		try {
			moduleCache.react = await import("react");
			moduleCache["react/jsx-runtime"] = await import("react/jsx-runtime");
			moduleCache["@react-email/components"] = await import(
				"@react-email/components"
			);
		} catch (error) {
			throw new Error(
				`Failed to pre-load required modules: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		const syncRequire = (moduleName: string) => {
			if (moduleName in moduleCache) {
				return moduleCache[moduleName];
			}

			throw new Error(
				`Module '${moduleName}' is not available. Only 'react', 'react/jsx-runtime', and '@react-email/components' are supported.`,
			);
		};

		const tempDirName = `jsx-transformer-${crypto.randomUUID()}`;
		const tempDir = join(tmpdir(), tempDirName);
		const tempFile = join(tempDir, "dynamic-component.js");

		const sandbox = {
			module: moduleObject,
			exports: moduleExports,
			require: syncRequire,
			console: console,
			process: process,
			Buffer: Buffer,
			__dirname: tempDir,
			__filename: tempFile,
			global: global,
			setTimeout: setTimeout,
			setInterval: setInterval,
			clearTimeout: clearTimeout,
			clearInterval: clearInterval,
		};

		const context = vm.createContext(sandbox);
		vm.runInContext(moduleCode, context, {
			filename: "dynamic-component.js",
			timeout: 5000,
		});

		const Component = moduleObject.exports.default;

		if (!Component) {
			throw new Error("No default export found in the transformed module");
		}

		if (typeof Component !== "function") {
			throw new Error("Default export is not a React component function");
		}

		return Component(props) as ReactElement;
	}

	async transformToComponent(
		jsxString: string,
		props: ComponentProps = {},
	): Promise<ReactElement> {
		const validation = this.validateJSXString(jsxString);
		if (!validation.isValid) {
			throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
		}

		const moduleCode = await this.transformToModule(jsxString);

		return this.createComponentFromModule(moduleCode, props);
	}

	async renderEmail(
		jsxString: string,
		props: ComponentProps = {},
		renderOptions: { pretty?: boolean } = {},
	): Promise<string> {
		const component = await this.transformToComponent(jsxString, props);

		return await render(component, renderOptions);
	}

	validate(jsxString: string): ValidationResult {
		return this.validateJSXString(jsxString);
	}
}
