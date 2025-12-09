import type { EmailPreset, EmailTone } from "@scribe/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createChat,
	getChatSession,
	getLatestEmailCode,
	getRecentChats,
} from "@/functions/chat";

export function useScribeChat(chatId?: string) {
	const queryClient = useQueryClient();

	const createChatMutation = useMutation({
		mutationFn: async ({
			prompt,
			brandId,
			tone,
			preset,
		}: {
			prompt: string;
			brandId?: string | null;
			tone?: EmailTone;
			preset?: EmailPreset;
		}) => {
			return await createChat({
				data: { prompt, brandId, emailTone: tone, emailPreset: preset },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const chatSession = useQuery({
		queryKey: ["chat", "session", chatId],
		queryFn: async () => {
			const chatSession = await getChatSession({ data: chatId || "" });

			return chatSession;
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
		chatSession: chatSession.data,
		isFetchingchatSession: chatSession.isFetching,
		isLoadingchatSession: chatSession.isLoading,
		latestEmailCode: getEmailCode.data,
		isFetchingLatestEmail: getEmailCode.isFetching,
		isLoadingLatestEmail: getEmailCode.isLoading,
	};
}
