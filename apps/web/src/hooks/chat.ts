import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createChat,
	getChatMessages,
	getLatestEmailCode,
	getRecentChats,
} from "@/functions/chat";

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

	const getEmailCode = useQuery({
		queryKey: ["chat", "email_code", chatId],
		queryFn: async () => {
			const emailCode = await getLatestEmailCode({ data: chatId || "" });

			return emailCode;
		},
		enabled: !!chatId,
	});

	const chats = useQuery({
		queryKey: ["chats"],
		queryFn: async () => {
			const chats = await getRecentChats({ data: {} });
			return chats;
		},
	});

	return {
		chats: chats.data,
		isFetchingChats: chats.isFetching,
		createChat: createChatMutation.mutateAsync,
		isCreating: createChatMutation.isPending,
		chatMessages: chatMessages.data,
		isFetchingChatMessages: chatMessages.isFetching,
		isLoadingChatMessages: chatMessages.isLoading,
		latestEmailCode: getEmailCode.data,
		isFetchingLatestEmail: getEmailCode.isFetching,
		isLoadingLatestEmail: getEmailCode.isLoading,
	};
}
