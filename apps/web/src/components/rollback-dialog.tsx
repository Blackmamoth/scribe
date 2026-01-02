import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RollbackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	messageCountToDelete?: number;
}

export function RollbackDialog({
	open,
	onOpenChange,
	onConfirm,
	messageCountToDelete,
}: RollbackDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Rollback to this point?</AlertDialogTitle>
					<AlertDialogDescription>
						This will roll back to this point and delete{" "}
						{messageCountToDelete !== undefined
							? messageCountToDelete === 1
								? "1 message"
								: `${messageCountToDelete} messages`
							: "all subsequent messages"}{" "}
						and email versions after this point. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Rollback</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
