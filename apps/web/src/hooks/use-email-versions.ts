import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { getEmailVersions, rollbackToVersion } from "@/functions/chat";

export type EmailVersion = {
	id: string;
	version: number;
	createdAt: Date;
	chatMessageId: string | null;
};

export function useEmailVersions(chatId: string) {
	const queryClient = useQueryClient();

	const versionsQuery = useQuery({
		queryKey: ["email_versions", chatId],
		queryFn: () => getEmailVersions({ data: { chatId: chatId || "" } }),
	});

	const rollbackMutation = useMutation({
		mutationFn: ({ versionId }: { versionId: string }) =>
			rollbackToVersion({
				data: { chatId: chatId || "", versionId },
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
		async (versionId: string) => {
			await rollbackMutation.mutateAsync({ versionId });
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
