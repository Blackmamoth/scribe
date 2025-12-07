import { createMiddleware, createStart } from "@tanstack/react-start";

const globalMiddleware = createMiddleware().server(async ({ next }) => {
	const response = await next();

	response.response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
	response.response.headers.set(
		"Cross-Origin-Embedder-Policy",
		"credentialless",
	);
	response.response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

	return response;
});

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [globalMiddleware],
	};
});
