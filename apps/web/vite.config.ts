import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		netlify(),
	],
	ssr: {
		external: ["esbuild"],
	},
	build: {
		rollupOptions: {
			external: ["esbuild"],
		},
	},
});
