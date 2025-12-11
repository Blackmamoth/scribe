import type { Brand } from "@scribe/db/types";
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

interface BrandsDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	brandsToDelete: Brand[] | null;
	onConfirm: () => void;
	isDeleting: boolean;
}

export function BrandsDeleteDialog({
	open,
	onOpenChange,
	brandsToDelete,
	onConfirm,
	isDeleting,
}: BrandsDeleteDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						You are about to delete{" "}
						<span className="font-semibold text-foreground">
							{brandsToDelete?.map((b) => b.name).join(", ")}
						</span>
						. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={isDeleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
