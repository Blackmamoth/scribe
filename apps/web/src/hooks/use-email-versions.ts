import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { getEmailVersions, rollbackToMessage } from "@/functions/chat";

export type EmailVersion = {
	id: string;
	version: number;
	createdAt: Date;
	chatMessageId: string | null;
	code?: string;
};

export function useEmailVersions(chatId: string) {
	const queryClient = useQueryClient();

	const versionsQuery = useQuery({
		queryKey: ["email_versions", chatId],
		queryFn: () => getEmailVersions({ data: { chatId: chatId || "" } }),
	});

	const rollbackMutation = useMutation({
		mutationFn: ({ messageId }: { messageId: string }) =>
			rollbackToMessage({
				data: { chatId: chatId || "", messageId },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["email_versions", chatId] });
			queryClient.invalidateQueries({
				queryKey: ["chat", "email_code", chatId],
			});
			queryClient.invalidateQueries({ queryKey: ["chat", "session", chatId] });
			toast.success("Rolled back successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const rollback = useCallback(
		async (messageId: string) => {
			await rollbackMutation.mutateAsync({ messageId });
		},
		[rollbackMutation],
	);

	return {
		versions: versionsQuery.data || [],
		isFetchingVersions: versionsQuery.isFetching,
		isLoadingVersions: versionsQuery.isLoading,
		rollback,
		isRollingBack: rollbackMutation.isPending,
	};
}
