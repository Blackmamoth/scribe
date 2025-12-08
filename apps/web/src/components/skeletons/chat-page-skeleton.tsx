import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatPageSkeleton() {
	return (
		<div className="h-full w-full">
			<ResizablePanelGroup
				direction="horizontal"
				className="h-full items-stretch"
			>
				<ResizablePanel defaultSize={40} minSize={30}>
					<div className="flex h-full flex-col">
						<div className="flex-1 space-y-4 p-4">
							{/* Chat bubbles skeleton */}
							<div className="flex max-w-[80%] items-start gap-2">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-20 w-48 rounded-lg" />
							</div>
							<div className="ml-auto flex max-w-[80%] flex-row-reverse items-start gap-2">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-12 w-32 rounded-lg" />
							</div>
							<div className="flex max-w-[80%] items-start gap-2">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-32 w-64 rounded-lg" />
							</div>
						</div>
						{/* Input area skeleton */}
						<div className="border-t p-4">
							<Skeleton className="h-24 w-full rounded-lg" />
						</div>
					</div>
				</ResizablePanel>

				<ResizableHandle />

				<ResizablePanel defaultSize={60} minSize={30}>
					<div className="flex h-full flex-col">
						{/* Preview header skeleton */}
						<div className="flex h-14 items-center justify-between border-b px-4">
							<div className="flex gap-2">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-20" />
							</div>
							<div className="flex gap-2">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-8 w-8 rounded-full" />
							</div>
						</div>
						{/* Preview content skeleton */}
						<div className="flex-1 bg-muted/30 p-8">
							<Skeleton className="h-full w-full rounded-lg bg-white/50" />
						</div>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
