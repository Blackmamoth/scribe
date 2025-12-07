import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createChat, getChatMessages } from "@/functions/chat";

export function useScribeChat(chatId?: string) {
	const createChatMutation = useMutation({
		mutationFn: async (prompt: string) => {
			return await createChat({ data: { prompt } });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const chatMessages = useQuery({
		queryKey: ["chat", "messages", chatId],
		queryFn: async () => {
			const messages = await getChatMessages({ data: chatId || "" });

			return messages;
		},
		enabled: !!chatId,
	});

	return {
		createChat: createChatMutation.mutateAsync,
		isCreating: createChatMutation.isPending,
		chatMessages: chatMessages.data,
		isFetchingChatMessages: chatMessages.isFetching,
	};
}
