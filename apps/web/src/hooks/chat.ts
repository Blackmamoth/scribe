import type { Chat, EmailPreset, EmailTone } from "@scribe/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	createChat,
	deleteChat,
	getChatSession,
	getLatestEmailCode,
	getRecentChats,
} from "@/functions/chat";

export function useScribeChat(chatId?: string) {
	const queryClient = useQueryClient();
	const [offset, setOffset] = useState(0);
	const [allChats, setAllChats] = useState<Chat[]>([]);
	const [hasMore, setHasMore] = useState(true);

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
			setOffset(0);
			setAllChats([]);
			setHasMore(true);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteChatMutation = useMutation({
		mutationFn: async (chatId: string) => {
			return await deleteChat({ data: chatId });
		},
		onSuccess: (data) => {
			// Remove chat from local state after server confirmation
			const chatId = data[0].id;

			setAllChats((prev) => prev.filter((chat) => chat.id !== chatId));

			// Handle empty page scenario
			const currentChatCount = allChats.filter(
				(chat) => chat.id !== chatId,
			).length;
			if (currentChatCount === 0 && offset > 0) {
				// Fetch previous page if current page becomes empty
				const newOffset = Math.max(0, offset - 10);
				setOffset(newOffset);
			}

			toast.success("Chat deleted successfully");
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
		queryKey: ["chats", offset],
		queryFn: async () => {
			const chats = await getRecentChats({ data: { limit: 10, offset } });
			return chats;
		},
		enabled: hasMore,
	});

	const fetchMoreChats = useCallback(() => {
		if (!hasMore || chats.isFetching) return;

		const newOffset = offset + 10;
		setOffset(newOffset);
	}, [offset, hasMore, chats.isFetching]);

	// Update allChats when new data is fetched
	useEffect(() => {
		if (chats.data) {
			if (offset === 0) {
				setAllChats(chats.data);
			} else {
				setAllChats((prev) => [...prev, ...chats.data]);
			}

			// Check if there are more chats to load
			if (chats.data.length < 10) {
				setHasMore(false);
			}
		}
	}, [chats.data, offset]);

	return {
		chats: allChats,
		isFetchingChats: chats.isFetching,
		isFetchingMoreChats: chats.isFetching && offset > 0,
		hasMore,
		fetchMoreChats,
		createChat: createChatMutation.mutateAsync,
		isCreating: createChatMutation.isPending,
		deleteChat: deleteChatMutation.mutateAsync,
		isDeleting: deleteChatMutation.isPending,
		chatSession: chatSession.data,
		isFetchingchatSession: chatSession.isFetching,
		isLoadingchatSession: chatSession.isLoading,
		latestEmailCode: getEmailCode.data,
		isFetchingLatestEmail: getEmailCode.isFetching,
		isLoadingLatestEmail: getEmailCode.isLoading,
	};
}
