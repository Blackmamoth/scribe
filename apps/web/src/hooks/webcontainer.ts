import { useWebContainerContext } from "@/context/webcontainer";

export function useWebContainer() {
	const ctx = useWebContainerContext();
	if (!ctx) throw new Error("useWebContainer must be inside provider");

	return ctx;
}
