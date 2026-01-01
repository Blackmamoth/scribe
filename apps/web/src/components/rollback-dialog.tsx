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
	targetVersion: number;
	messageCountToDelete: number;
}

export function RollbackDialog({
	open,
	onOpenChange,
	onConfirm,
	targetVersion,
	messageCountToDelete,
}: RollbackDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Rollback to version {targetVersion}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action will delete{" "}
						{messageCountToDelete === 1
							? "1 message"
							: `${messageCountToDelete} messages`}{" "}
						and all email versions after this point. This action cannot be
						undone.
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
