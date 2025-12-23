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
import { authClient } from "@/lib/auth-client";

export function useScribeChat(chatId?: string) {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const [offset, setOffset] = useState(0);
	const [allChats, setAllChats] = useState<Chat[]>([]);
	const [hasMore, setHasMore] = useState(true);

	const createChatMutation = useMutation({
		mutationFn: ({
			prompt,
			brandId,
			tone,
			preset,
		}: {
			prompt: string;
			brandId?: string | null;
			tone?: EmailTone;
			preset?: EmailPreset;
		}) =>
			createChat({
				data: { prompt, brandId, emailTone: tone, emailPreset: preset },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
			setOffset(0);
			setAllChats([]);
			setHasMore(true);
		},
		onError: (error) => toast.error(error.message),
	});

	const deleteChatMutation = useMutation({
		mutationFn: (id: string) => deleteChat({ data: { id } }),
		onSuccess: (data) => {
			const deletedChatId = data[0].id;

			setAllChats((prev) => prev.filter((chat) => chat.id !== deletedChatId));

			const currentChatCount = allChats.filter(
				(chat) => chat.id !== deletedChatId,
			).length;
			if (currentChatCount === 0 && offset > 0) {
				const newOffset = Math.max(0, offset - 10);
				setOffset(newOffset);
			}

			toast.success("Chat deleted successfully");
		},
		onError: (error) => toast.error(error.message),
	});

	const chatSessionQuery = useQuery({
		queryKey: ["chat", "session", chatId],
		queryFn: () => getChatSession({ data: { id: chatId || "" } }),
		enabled: !!chatId,
	});

	const emailCodeQuery = useQuery({
		queryKey: ["chat", "email_code", chatId],
		queryFn: () => getLatestEmailCode({ data: { id: chatId || "" } }),
		enabled: !!chatId,
	});

	const chatsQuery = useQuery({
		queryKey: ["chats", offset],
		queryFn: () => getRecentChats({ data: { limit: 10, offset } }),
		enabled: hasMore && !!session?.user,
	});

	const fetchMoreChats = useCallback(() => {
		if (!hasMore || chatsQuery.isFetching) return;
		setOffset(offset + 10);
	}, [offset, hasMore, chatsQuery.isFetching]);

	useEffect(() => {
		if (chatsQuery.data) {
			if (offset === 0) {
				setAllChats(chatsQuery.data);
			} else {
				setAllChats((prev) => [...prev, ...chatsQuery.data]);
			}

			if (chatsQuery.data.length < 10) {
				setHasMore(false);
			}
		}
	}, [chatsQuery.data, offset]);

	return {
		chats: allChats,
		isFetchingChats: chatsQuery.isFetching,
		isFetchingMoreChats: chatsQuery.isFetching && offset > 0,
		hasMore,
		fetchMoreChats,
		createChat: createChatMutation.mutateAsync,
		isCreating: createChatMutation.isPending,
		deleteChat: deleteChatMutation.mutateAsync,
		isDeleting: deleteChatMutation.isPending,
		chatSession: chatSessionQuery.data,
		isFetchingChatSession: chatSessionQuery.isFetching,
		isLoadingChatSession: chatSessionQuery.isLoading,
		latestEmailCode: emailCodeQuery.data,
		isFetchingLatestEmail: emailCodeQuery.isFetching,
		isLoadingLatestEmail: emailCodeQuery.isLoading,
	};
}
