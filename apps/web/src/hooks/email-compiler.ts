import * as Babel from "@babel/standalone";
import * as ReactEmailComponents from "@react-email/components";
import { render } from "@react-email/render";
import React, { useCallback, useMemo } from "react";

interface CompileResult {
	html: string;
	error: string | null;
}

export function useEmailCompiler() {
	const transformCode = useCallback((code: string): string => {
		const result = Babel.transform(code, {
			presets: ["react", "typescript"],
			plugins: ["transform-modules-commonjs"],
			filename: "email.tsx",
		});

		if (!result.code) {
			throw new Error("Babel transformation returned empty result");
		}

		return result.code;
	}, []);

	const createModuleScope = useCallback(() => {
		const moduleExports: Record<string, unknown> = {};
		const moduleObject = { exports: moduleExports };

		const moduleCache: Record<string, unknown> = {
			react: React,
			"@react-email/components": ReactEmailComponents,
		};

		const mockRequire = (moduleName: string): unknown => {
			if (moduleName in moduleCache) {
				return moduleCache[moduleName];
			}
			throw new Error(
				`Module '${moduleName}' is not available. Only 'react' and '@react-email/components' are supported.`,
			);
		};

		return {
			React,
			require: mockRequire,
			module: moduleObject,
			exports: moduleExports,
		};
	}, []);

	const executeCode = useCallback(
		(transformedCode: string): React.ComponentType => {
			const scope = createModuleScope();

			const executeInScope = new Function(
				"React",
				"require",
				"module",
				"exports",
				`
				${transformedCode}
				return module.exports.default || module.exports;
			`,
			);

			const Component = executeInScope(
				scope.React,
				scope.require,
				scope.module,
				scope.exports,
			);

			if (!Component) {
				throw new Error(
					"No default export found. Make sure your email component uses 'export default'.",
				);
			}

			if (typeof Component !== "function") {
				throw new Error(
					"Default export is not a valid React component function.",
				);
			}

			return Component as React.ComponentType;
		},
		[createModuleScope],
	);

	const compileAndRender = useCallback(
		async (code: string): Promise<CompileResult> => {
			if (!code || code.trim() === "") {
				return { html: "", error: null };
			}

			try {
				const transformedCode = transformCode(code);

				const Component = executeCode(transformedCode);

				const html = await render(React.createElement(Component), {
					pretty: true,
				});

				return { html, error: null };
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown compilation error";
				return { html: "", error: errorMessage };
			}
		},
		[transformCode, executeCode],
	);

	const status = useMemo(() => "ready" as const, []);

	return {
		status,
		compileAndRender,
	};
}
